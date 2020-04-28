/**
 * Primary file for the API
 */

 // Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');


// Declare the application
const app = {};

// initialize the application
app.init = (done) => {

    // Start the server
    server.init();

    // Start the workers
    workers.init();

    // Start the CLI, but make sure it starts last
    setTimeout(() => {
        cli.init();
        done();
    }, 50);
};

// Self invoking only if required directly
if(require.main === module) {
    app.init(() => {});
}

// Export the application
module.exports = app;