var squabble = require("squabble").createParser(),
    smtp = require("smtp-protocol"),
    http = require("request"),
    readFile = require("fs").readFileSync,
    MailParser = require("mailparser").MailParser,
    args,
    tlsTokens,
    serverOpts = {};

// setup CLI argument parsing
squabble.shortOpts().longOpts().stopper()
    .option("-T", "--tls")
    .required("ENDPOINT");

// parse arguments
args = squabble.parse();
serverOpts.endpoint = args.named.ENDPOINT;
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
        console.log(to);
        ack.accept();
    });

    // send message to web endpoint
    req.on("message", function(stream, ack) {
        stream.pipe(new MailParser().on("end", function(email) {
            http.post({
                url: serverOpts.endpoint,
                json: email
            }, function(err, res, body) {
                if (err) console.error(err);
            })
        }).on("error", function(err) {
            console.error(err);
        }));

        ack.accept();
    });
}).listen(process.env.NODE_PORT || 25);

