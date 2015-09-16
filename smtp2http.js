var squabble = require("squabble").createParser(),
    smtp = require("smtp-protocol"),
    http = require("request"),
    readFile = require("fs").readFileSync,
    MailParser = require("mailparser").MailParser,
    args,
    tlsTokens,
    serverOpts = {};

// enable color support
require("colors");

// setup CLI argument parsing
squabble.shortOpts().longOpts().stopper()
    .option("-T", "--tls")
    .flag("-s", "-q", "--silent", "--quiet")
    .flag("-v", "--verbose")
    .required("ENDPOINT");

// parse arguments
args = squabble.parse();
serverOpts.endpoint = args.named.ENDPOINT;

// configure console output
if (args.named["--quiet"]) {
    console.log = function() {};
    console.error = function() {};
} else if (!args.named["--verbose"]) {
    console.log = function() {};
}

if (args.named["--tls"]) {
    tlsTokens = args.named["--tls"].split(":");
    switch (tlsTokens.length) {
        case 1:
            serverOpts.pfx = readFile(tlsTokens.shift());
            break;
        case 2:
            serverOpts.cert = readFile(tlsTokens.shift());
            serverOpts.key = readFile(tlsTokens.shift());
            break;
        case 3:
            serverOpts.cert = readFile(tlsTokens.shift());
            serverOpts.key = readFile(tlsTokens.shift());
            serverOpts.ca = readFile(tlsTokens.shift());
            break;
        default:
            throw new Error("unrecognized --tls argument");
    }
}

// create and start SMTP server
smtp.createServer(serverOpts, function(req) {
    // accept all incoming messages
    req.on("to", function(to, ack) {
        console.log("incoming message to " + to);
        ack.accept();
    });

    // send message to web endpoint
    req.on("message", function(stream, ack) {
        stream.pipe(new MailParser().on("end", function(email) {
            var msg;

            http.post({
                url: serverOpts.endpoint,
                json: email
            }, function(err, res, body) {
                if (err) {
                    msg = "error".red + " " + err.message;
                    console.error(msg);
                }

                else if (res.statusCode < 200 || res.statusCode > 299) {
                    msg = res.statusCode + " -----------";
                    console.error(msg.magenta);
                    console.error(body);
                    console.error("---------------".magenta);
                }

                else {
                    console.log("passed message successfully");
                }
            })
        }).on("error", function(err) {
            console.error(err);
        }));

        ack.accept();
    });
}).listen(process.env.NODE_PORT || 25);

