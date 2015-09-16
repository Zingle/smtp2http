var squabble = require("squabble").createParser(),
    args;

// setup CLI argument parsing
squabble.shortOpts().longOpts().stopper()
    .required("ENDPOINT");

// parse arguments
args = squabble.parse();

