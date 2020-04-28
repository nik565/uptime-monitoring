/**
 *  Workers-related tasks
 * 
 */

// Dependencies
const fs = require('fs');
const https = require('https');
const http = require('http');
const _data = require('./data');
const url = require('url');
const helpers = require('./helpers');
const _logs = require('./logs');
const util = require('util');
const debug = util.debuglog('workers');

// Instantiate the workers object
const workers = {};

// Lookup all checks, get their data and send to a validator
workers.gatherAllChecks = () => {

    // Get all checks
    _data.list('checks', (err, checks) => {
        if (!err && checks && checks.length > 0) {

            checks.forEach(check => {
                // Read in the check data
                _data.read('checks', check, (err, originalCheckData) => {
                    if (!err && originalCheckData) {
                        // Pass it to the check validator, and let that function continue or log errors as needed
                        workers.validateCheckData(originalCheckData);
                    } else {
                        debug('Error reading one of the check data');
                    }
                });
            })
        } else {
            debug('Error: Could not find any checks to process');
        }
    });
};

// Sanity-check the check-data
workers.validateCheckData = originalCheckData => {
    originalCheckData = typeof (originalCheckData) == 'object' && originalCheckData !== null ? originalCheckData : {};

    originalCheckData.id = typeof (originalCheckData.id) == 'string' &&
        originalCheckData.id.trim().length === 20 ? originalCheckData.id.trim() : false;

    originalCheckData.userPhone = typeof (originalCheckData.userPhone) == 'string' &&
        originalCheckData.userPhone.trim().length === 10 ? originalCheckData.userPhone.trim() : false;

    originalCheckData.protocol = typeof (originalCheckData.protocol) == 'string' &&
        ['https', 'http'].indexOf(originalCheckData.protocol) > -1 ? originalCheckData.protocol : false;

    originalCheckData.url = typeof (originalCheckData.url) == 'string' &&
        originalCheckData.url.trim().length > 0 ? originalCheckData.url.trim() : false;

    originalCheckData.method = typeof (originalCheckData.method) == 'string' &&
        ['post', 'get', 'put', 'delete'].indexOf(originalCheckData.method) > -1 ? originalCheckData.method : false;

    originalCheckData.successCodes = typeof (originalCheckData.successCodes) == 'object' &&
        originalCheckData.successCodes instanceof Array && originalCheckData.successCodes.length > 0 ? originalCheckData.successCodes : false;

    originalCheckData.timeoutSeconds = typeof (originalCheckData.timeoutSeconds) == 'number' && originalCheckData.timeoutSeconds % 1 === 0 &&
        originalCheckData.timeoutSeconds >= 1 && originalCheckData.timeoutSeconds <= 5 ? originalCheckData.timeoutSeconds : false;

    // Set the keys that may not be set (if workers have never seen this check before)
    originalCheckData.state = typeof (originalCheckData.state) == 'string' &&
        ['up', 'down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : 'down';

    originalCheckData.lastChecked = typeof (originalCheckData.lastChecked) == 'number' &&
        originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked : false;

    // If all the checks passed, then pass the data along to the next step in the process
    if (originalCheckData.id &&
        originalCheckData.userPhone &&
        originalCheckData.protocol &&
        originalCheckData.url &&
        originalCheckData.method &&
        originalCheckData.successCodes &&
        originalCheckData.timeoutSeconds) {
        // Call performCheck method
        workers.performCheck(originalCheckData);
    } else {
        debug('Error: One of the checks is not properly formatted, skipping it.');
    }
};

// Perform the check, send the originalCheckdata and the outcome of the check process to the next step in the process
workers.performCheck = originalCheckData => {

    // Prepare the initial check outcome
    const checkOutcome = {
        'error': false,
        'responseCode': false
    };

    // Mark that the outcome has not been sent yet
    let outcomeSent = false;

    // Parse the hostname and path from the oroginal check data
    const parsedUrl = url.parse(`${originalCheckData.protocol}://${originalCheckData.url}`, true);
    const hostname = parsedUrl.hostname;
    const path = parsedUrl.path; // Using "path" and not "pathname" because we want the query string

    // Construct the request
    const requestDetails = {
        'protocol': `${originalCheckData.protocol}:`,
        'hostname': hostname,
        'method': originalCheckData.method.toUpperCase(),
        'path': path,
        'timeout': originalCheckData.timeoutSeconds * 1000 // converting to milliseconds
    };

    if(hostname == 'localhost') {
        requestDetails.port = parsedUrl.port
    };


    // Instantiate the request object (either using http ot https module)
    const _moduleToUse = originalCheckData.protocol == 'http' ? http : https;
    const req = _moduleToUse.request(requestDetails, res => {

        // Extract the status of the sent request
        const status = res.statusCode;

        // Update the checkOutcome and pass the data along
        checkOutcome.responseCode = status;
        if (!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }
    });

    // Bind to the error event so that it doesn't get thrown
    req.on('error', error => {
        
        // Update the checkOutcome and pass the data along
        checkOutcome.error = {
            'error': true,
            'value': error
        };
        if (!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }
    });

    // Bind to the timeout event
    req.on('timeout', () => {

        // Update the checkOutcome and pass the data along
        checkOutcome.error = {
            'error': true,
            'value': 'timeout'
        };
        if (!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }
    });

    // End the request
    req.end();
};

// Process the check outcome, update the check data if needed and trigger the alert to the user if needed
// Special logic for accomodating a check that never has been tested before (don't alert on that one)
workers.processCheckOutcome = (originalCheckData, checkOutcome) => {

    // Decide if the check is considered up or down
    const currentState = !checkOutcome.error && checkOutcome.responseCode &&
        originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down';
    
    // Decide if an alert is warranted
    const alertWarranted = originalCheckData.lastChecked && originalCheckData.state !== currentState ? true : false;

    // Log the outcome
    const timeOfCheck = Date.now();
    workers.log(originalCheckData, checkOutcome, currentState, alertWarranted, timeOfCheck);

    // Update the check data
    const newCheckData = originalCheckData;
    newCheckData.state = currentState;
    newCheckData.lastChecked = timeOfCheck;

    // Save the updates
    _data.update('checks', newCheckData.id, newCheckData, err => {

        if(!err) {
            // Send the check data to the next phase in the process if needed
            if(alertWarranted) {
                workers.alertUserToStatusChange(newCheckData);
            } else {
                debug('Check outcome has not changed, no alert needed');
            }
        } else {
            debug('Error trying to update one of the checks');
        }
    });
};

// Alert the user as to a change in their check status
workers.alertUserToStatusChange = newCheckData => {

    // Craft the message
    const msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`;

    // Call the helper method to send sms
    helpers.sendTwilioSms(newCheckData.userPhone, msg, err => {
        if(!err) {
            debug('Success: User was alerted to a success change, via sms: ', msg);
        } else {
            debug('Error: Could not send sms alert to user who had a state change in their check');
        }
    });
};

workers.log = (originalCheckData, checkOutcome, currentState, alertWarranted, timeOfCheck) => {

    // Form the log
    const logData = {
        'check': originalCheckData,
        'outcome': checkOutcome,
        'state': currentState,
        'alert': alertWarranted,
        'time': timeOfCheck
    };

    // Convert data to a string
    const logDataAsString = JSON.stringify(logData);

    // Determine the name of the log file
    const logFileName = originalCheckData.id;

    // Append to the log string to the file
    _logs.appned(logFileName, logDataAsString, err => {
        if(!err) {
            debug('Logging to file succeded');
        } else {
            debug('Logging to file failed');
        }
    });
}

// Timer to execute the worker-process once per minute
workers.loop = () => {
    setInterval(() => {
        workers.gatherAllChecks();
    }, 1000 * 60);
};

// Rorate (compress) the log files
workers.rotateLogs = () => {

    // List all the (non-compressed) log files
    _logs.list(false, (err, logs) => {
        if(!err && logs && logs.length > 0) {

            logs.forEach(logFileName => {

                // Compress the data into a different file
                const logId = logFileName.replace('.log', '');
                const newFileId = `${logId}-${Date.now()}`;

                _logs.compress(logId, newFileId, err => {
                    if(!err) {

                        // Truncate the log
                        _logs.truncate(logId, err => {
                            if(!err) {
                                debug('Success truncating logFile');
                            } else {
                                debug('Error truncating logFile');
                            }
                        });
                    } else {
                        debug('Error compressing one of the log files', err);
                    }
                });
            });
        } else {
            debug('Error: could not find any files to rotate');
        }
    });
}

// Timer to execute the log-rotation once per day
workers.logRotationLoop = () => {
    setInterval(() => {
        workers.rotateLogs();
    }, 1000 * 60 * 60 * 24);
};


// Initialization block
workers.init = () => {

    // Send to console, in yellow
    console.log('\x1b[33m%s\x1b[0m', 'Background workers are running');

    //Execute all the checks immediately
    workers.gatherAllChecks();

    // call the loop so the checks will execute later on
    workers.loop();

    // Compress all the logs immediately
    workers.rotateLogs();

    // Call the compression loop so logs will be compressed later on
    workers.logRotationLoop();
};

// Export the module
module.exports = workers;