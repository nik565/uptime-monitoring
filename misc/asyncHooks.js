/**
 *  Async Hooks Example
 *  This Module helps in tracking down the life cycle of an asynchronous operations
 * 
 *  NOTE:- when ae are tracking the life cycle of an asynchronous operations, we shouldn't use an asynchronous operations to track them
 *  console.log is an asynchronous operation, although it outputs very quickly but it's asynchronous
 */

// Dependencies
const async_hooks = require('async_hooks');
const fs = require('fs');

// Target Execution Context
const targetExecutionContext = false;

// An arbitrary async function
const whatTimeIsIt = done => {
    setInterval(() => {
        fs.writeSync(1, `When the setInterval runs, the execution context is ${async_hooks.executionAsyncId()} \n`);
        done(Date.now());
    }, 1000);
};

// Call the async function
whatTimeIsIt(time => {

    fs.writeSync(1, `Time is ${time} \n`);
});

// Hooks
const hooks = {
    init(asyncId, type, triggerAsyncId, resource) {
        fs.writeSync(1, `Hook init: ${asyncId}\n`);
    },
    before(asyncId) {
        fs.writeSync(1, `Hook before: ${asyncId}\n`);
    },
    after(asyncId) {
        fs.writeSync(1, `Hook after: ${asyncId}\n`);
    },
    destroy(asyncId) {
        fs.writeSync(1, `Hook destroy: ${asyncId}\n`);
    },
    promiseResolve(asyncId) {
        fs.writeSync(1, `Hook promiseResolve: ${asyncId}\n`);
    }
};

// Create a new AsyncHooks instance
const asyncHook = async_hooks.createHook(hooks);
asyncHook.enable();
