#!/usr/bin/env node
var squabble = require("squabble").createParser(),
    smtp = require("smtp-protocol"),
    http = require("request"),
    tlsfs = require("tlsfs"),
    copy = require("objektify").copy,
    MailParser = require("mailparser").MailParser,
    args, tlsTokens, serverOpts = {};

// enable color support
require("colors");

// setup CLI argument parsing
squabble.shortOpts().longOpts().stopper()
    .option("-T", "--tls")
    .flag("-s", "-q", "--silent", "--quiet")
    .flag("-v", "--verbose")
    .list("-H", "--header")
    .required("ENDPOINT");

// parse and apply arguments
args = squabble.parse();
serverOpts.endpoint = args.named.ENDPOINT;
serverOpts.headers = {};
args.named["--header"].forEach(function(headerLine) {
    var name = headerLine.split(":")[0];
    serverOpts.headers[name] = serverOpts.headers[name] || [];
    serverOpts.headers[name].push(headerLine.substr(name.length+1).trim());
});

// configure console output
if (args.named["--quiet"]) {
    console.log = function() {};
    console.error = function() {};
} else if (!args.named["--verbose"]) {
    console.log = function() {};
}

if (args.named["--tls"]) {
    tlsPaths = args.named["--tls"].split(":");
    copy(serverOpts, tlsfs.readCertsSync(tlsPaths));
}

// create and start SMTP server
smtp.createServer(serverOpts, function(req) {
    var id;

    // accept all incoming messages
    req.on("to", function(to, ack) {
        id = to;
        console.log("-->".yellow + "incoming message to " + to);
        ack.accept();
    });

    // send message to web endpoint
    req.on("message", function(stream, ack) {
        stream.pipe(new MailParser().on("end", function(email) {
            http.post({
                url: serverOpts.endpoint,
                json: email,
                headers: serverOpts.headers
            }, function(err, res, body) {
                var msg;

                if (err) return console.error("error".red + " " + err.message);
                
                msg = String(res.statusCode);
                if (res.statusCode >= 500) {
                    console.error(msg.red + " " + body.replace("\n", "\\n"));
                } else if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log(msg.green + " message passed " + id);
                } else {
                    console.error(msg.magenta + " unexpected");
                }
            })
        }).on("error", function(err) {
            console.error(err);
        }));

        ack.accept();
    });
}).listen(process.env.SMTP_PORT || 25);

