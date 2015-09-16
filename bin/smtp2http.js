var squabble = require("squabble").createParser(),
    smtp = require("smtp-protocol"),
    http = require("request"),
    readFile = require("fs").readFileSync,
    args,
    tlsTokens,
    serverOpts = {};

// setup CLI argument parsing
squabble.shortOpts().longOpts().stopper()
    .option("-T", "--tls")
    .required("ENDPOINT");

// parse arguments
args = squabble.parse();
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
        ack.accept();
    });

    // send message to web endpoint
    req.on("message", function(stream, ack) {
        stream.pipe(process.stdout);
        ack.accept();
    });
}).listen(process.env.NODE_PORT || 25);
