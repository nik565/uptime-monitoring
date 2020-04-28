/**
 *  Test Runner
 */

// Override the NODE_ENV variable
process.env.NODE_ENV = 'testing';

// Dependencies
const helpers = require('../lib/helpers');
const assert = require('assert');

// Application logic for test runner
const _app = {};

// Container for tests
_app.tests = {};

// Add on the unit tests
_app.tests.unit = require('./unit');

// Add on the API tests
_app.tests.api = require('./api');


// Count all the tests
_app.countTests = () => {
    let counter = 0;
    for (const key in _app.tests) {
        if (_app.tests.hasOwnProperty(key)) {
            const subTests = _app.tests[key];

            for (const testName in subTests) {
                if (subTests.hasOwnProperty(testName)) {
                    counter++;                    
                }
            }            
        }
    }
    return counter;
};

// Run all the tests, collecting the errors and successes
_app.runTests = () => {

    const errors = [];
    let successes = 0;
    let limit = _app.countTests();
    let counter = 0;

    for (const key in _app.tests) {
        if (_app.tests.hasOwnProperty(key)) {
            
            const subTests = _app.tests[key];
            
            for (const testName in subTests) {
                if (subTests.hasOwnProperty(testName)) {
                    const element = subTests[testName];
                    
                    (function() {

                        const tempTestName = testName;
                        const testValue = subTests[tempTestName];

                        // Call the test
                        try {
                            testValue(() => {
                                // If it calls back without throwing, then it succeeded, so log it in green
                                console.log('\x1b[32m%s\x1b[0m', testName);
                                counter++;
                                successes++;
                                if(counter == limit) {
                                    // Produce the results
                                    _app.produceResults(limit, successes, errors);
                                }
                            });
                        } catch (error) {
                            debugger
                            // If it throws an error, then it failed, so capture the error thrown and log it in red
                            errors.push({
                                'name': tempTestName,
                                'error': error
                            });
                            console.log('\x1b[31m%s\x1b[0m', testName);
                            counter++;
                            if(counter == limit) {
                                // Produce the results
                                _app.produceResults(limit, successes, errors);
                            }
                        }
                    })();
                }
            }
        }
    }

};

// Produce a test outcome report
_app.produceResults = (limit, successes, errors) => {
    console.log('');
    console.log('---------------- BEGIN TEST REPORTS -----------------');
    console.log('');
    console.log('Total Tests: ', limit);
    console.log('Pass: ', successes);
    console.log('Fail: ', errors.length);
    console.log('');

    // If there are erros, then print them in detail
    if(errors.length > 0) {

        console.log('-------------- BEGIN ERROR DETAILS -----------------');
        console.log('');

        errors.forEach(testError => {
            console.log('\x1b[31m%s\x1b[0m', testError.name);
            console.log(testError.error);
            console.log('');
        });
        console.log('');
        console.log('-------------- END ERROR DETAILS -------------------');
    }

    console.log('');
    console.log('----------------- END TEST REPORT ---------------------');

    // Kill the process
    process.exit(0);
}

// Run the tests
_app.runTests();