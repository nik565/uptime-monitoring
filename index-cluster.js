/**
 * Primary file for the API
 */

// Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');
const os = require('os');
const cluster = require('cluster');


// Declare the application
const app = {};

// initialize the application
app.init = (done) => {

    // If we are on master thread, start the background workers and the CLI
    if (cluster.isMaster) {

        // Start the workers
        workers.init();

        // Start the CLI, but make sure it starts last
        setTimeout(() => {
            cli.init();
            done();
        }, 50);

        // Fork the process
        for(let i = 0; i < os.cpus().length; i++) {
            cluster.fork();
        }
    } else {

        // If we are not on master thread, start the HTTP/HTTPS server
        server.init();
    }

};

// Self invoking only if required directly
if (require.main === module) {
    app.init(() => { });
}

// Export the application
module.exports = app;