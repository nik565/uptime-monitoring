/**
 *  Example VM
 *  Running some arbitrary command
 */

// Dependencies
const vm = require('vm');
// const bar = 0;
// let xyz;
// Define a context for the script to run
const context = {
    'foo': 10
};

// Define the script
const script = new vm.Script(`
    foo = foo * foo;
     bar = foo + foo;
     xyz = -23;
`);

// Run the script
script.runInNewContext(context);
console.log(context);