/**
 *  Example REPL Server
 *  Take in the work 'fizz' and log out 'buzz'
 */

// Dependencies
const repl = require('repl');

// Start the REPL
repl.start({
    'prompt': '>',
    'eval': str => {
        // Evaluation function for incoming message
        console.log('At the evaluation stage: ', str);

        // If the user said 'fizz', say 'buzz' back to them
        if(str.indexOf('fizz') > -1) {
            console.log(str.replace('fizz', 'buzz'));
        } else {
            console.log(`Does not include word 'fizz'`);
        }

        console.log(''); // print an empty line at the end of evaluation
    }
});