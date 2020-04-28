/**
 * Primary file for the API
 */

 // Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');
const exampleDebuggingProblem = require('./lib/exampleDebuggingProblem');

// Declare the application
const app = {};

// initialize the application
app.init = () => {

    // Start the server
    server.init();

    // Start the workers
    workers.init();

    // Start the CLI, but make sure it starts last
    setTimeout(() => {
        cli.init();
    }, 50);

    // Define foo
    let foo = 1;

    // Increment foo
    foo++;

    // Square it
    foo = foo * foo;

    // Convert foo to string
    foo = foo.toString();

    // Call the init script that will throw error
    exampleDebuggingProblem.init();
};

// Execute the application
app.init();

// Export the application
module.exports = app;