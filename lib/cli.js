/**
 *  CLI-Related tasks
 */

// Depenedecies
const readline = require('readline');
const util = require('util');
const os = require('os');
const v8 = require('v8');
const debug = util.debuglog('cli');
const _data = require('./data');
const _logs = require('./logs');
const helpers = require('./helpers');
const events = require('events');
class _events extends events { };
const e = new _events();
const childProcess = require('child_process');

// Instantiate the CLI module
const cli = {};

// Input handlers
e.on('man', str => {
    cli.handlers.help();
});

e.on('help', str => {
    cli.handlers.help();
});

e.on('exit', str => {
    cli.handlers.exit();
});

e.on('stats', str => {
    cli.handlers.stats();
});

e.on('list users', str => {
    cli.handlers.listUsers();
});

e.on('more user info', str => {
    cli.handlers.moreUserInfo(str);
});

e.on('list checks', str => {
    cli.handlers.listChecks(str);
});

e.on('more check info', str => {
    cli.handlers.moreCheckInfo(str);
});

e.on('list logs', str => {
    cli.handlers.listLogs();
});

e.on('more log info', str => {
    cli.handlers.moreLogInfo(str);
});

// Responders object
cli.handlers = {};

// Man / Help
cli.handlers.help = () => {
    const commands = {
        'exit': 'Kill the CLI (and the rest of the application)',
        'man': 'Show this help page',
        'help': 'Alias of the "man" command',
        'stats': 'Get statistics on the underlying operating system and the resource utilization',
        'list users': 'Show the list of all registered (undeleted) users in the system',
        'more user info --{userId}': 'Show details of a specific user',
        'list checks --up --down': 'Show a list of all the active checks in the system, including their state. The "--up" and "--down" flags are both optional',
        'more check info --{checkId}': 'Show details of a specified check',
        'list logs': 'Show a list of all the log files available to be read (compressed only)',
        'more log info --{fileName}': 'Show details of a specified log file'
    };

    // Show a header for the help page that is as wide as screen
    cli.horizontalLine();
    cli.centered('CLI Manual');
    cli.horizontalLine();
    cli.verticalSpace(2);

    // Show each command, followed by its explanation, in white and yellow respectively
    for (const key in commands) {
        if (commands.hasOwnProperty(key)) {
            const value = commands[key];
            let line = `\x1b[33m${key}\x1b[0m`;
            const padding = 60 - line.length;
            for (let i = 0; i < padding; i++) {
                line += ' ';
            }
            line += value;
            console.log(line);
            cli.verticalSpace();
        }
    }
    cli.verticalSpace(1);

    // End with another horizintal line
    cli.horizontalLine();
}

// Create a vertical space
cli.verticalSpace = (lines) => {

    lines = typeof (lines) == 'number' && lines > 0 ? lines : 1;
    for (let i = 0; i < lines; i++) {
        console.log('');
    }
};

// Create a horizontal lines across the screen
cli.horizontalLine = () => {

    // Get the available screen size
    const width = process.stdout.columns;

    let line = '';
    for (let i = 0; i < width; i++) {
        line += '-';
    }

    console.log(line);
};

// Create centered text on the screen
cli.centered = (str) => {

    // Sanity check
    str = typeof (str) == 'string' && str.trim().length > 0 ? str : '';

    // Get the available screen size
    const width = process.stdout.columns;

    // Calculate the left padding there should be
    const leftPadding = Math.floor((width - str.length) / 2);

    // Put in left padded spaces before the string itself
    let line = '';
    for (let i = 0; i < leftPadding; i++) {
        line += ' ';
    }
    line += str;

    console.log(line);
}

// Exit
cli.handlers.exit = () => {
    process.exit(0);
}

// Stats
cli.handlers.stats = () => {

    // Compile an object of Stats
    const stats = {
        'Load Average': os.loadavg().join(' '),
        'CPU Count': os.cpus().length,
        'Free Memory': os.freemem(),
        'Current Malloced Memory': v8.getHeapStatistics().malloced_memory,
        'Peak malloced Memory': v8.getHeapStatistics().peak_malloced_memory,
        'Allocated Heap Used (%)': Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100),
        'Available Heap Allocated (%)': Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) * 100),
        'Uptime': `${os.uptime()} Seconds`
    };

    // Create a header for the stats
    cli.horizontalLine();
    cli.centered('SYSTEM STATISTICS');
    cli.horizontalLine();
    cli.verticalSpace(2);

    // Log out each stat
    for (const key in stats) {
        if (stats.hasOwnProperty(key)) {
            const value = stats[key];
            let line = `\x1b[33m${key}\x1b[0m`;
            const padding = 60 - line.length;
            for (let i = 0; i < padding; i++) {
                line += ' ';
            }
            line += value;
            console.log(line);
            cli.verticalSpace();
        }
    }
    cli.verticalSpace(1);

    // End with another horizintal line
    cli.horizontalLine();
}

// More user info
cli.handlers.moreUserInfo = (str) => {
    
    // Get ID from the string
    const arr = str.split('--');
    const userId = typeof (arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;

    if(userId) {
        
        // Lookup the user
        _data.read('users', userId, (err, userData) => {
            if(!err && userData) {
                
                // Delete the hashed password
                delete userData.password;

                // Print the user with text highlighting
                console.dir(userData, {'colors': true});
                cli.verticalSpace();
            } else {
                console.log('Not a valid User!');
                cli.verticalSpace();
            }
        });
    }
}

// List Checks
cli.handlers.listChecks = (str) => {
    _data.list('checks', (err, checkIds) => {
        if(!err && checkIds && checkIds.length > 0) {
            cli.verticalSpace();
            checkIds.forEach(checkId => {
                _data.read('checks', checkId, (err, checkData) => {
                    if(!err && checkData) {
                        let includeCheck = false;
                        let stateInLowerCase = str.toLowerCase();
                        // Get the state, default to down
                        const state = typeof (checkData.state) == 'string' ? checkData.state : 'down';

                        // Get the state, default to unknown
                        const stateOrUnknown = typeof (checkData.state) == 'string' ? checkData.state : 'unknown';

                        // If the user has specified the state, or hasn't specified any state, include the current check accordingly
                        if(stateInLowerCase.indexOf(`--${state}`) > -1 || (stateInLowerCase.indexOf('--down') == -1 && stateInLowerCase.indexOf('--up') == -1)) {
                            const line = `ID: ${checkData.id}, ${checkData.method.toUpperCase()}, ${checkData.protocol}://${checkData.url}, State: ${stateOrUnknown}`;
                            console.log(line);
                            cli.verticalSpace();
                        }
                    }
                });
            });
        }
    });
}

// List Users
cli.handlers.listUsers = () => {

    _data.list('users', (err, userIds) => {
        if (!err && userIds && userIds.length > 0) {
            cli.verticalSpace();
            userIds.forEach(userId => {
                _data.read('users', userId, (err, userData) => {
                    if (!err && userData) {
                        let line = `Name: ${userData.firstName} ${userData.lastName}, Phone: ${userData.phone}, Checks: `;
                        const numberOfChecks = typeof (userData.checks) == 'object' &&
                            userData.checks instanceof Array && userData.checks.length > 0 ? userData.checks.length : 0;
                        line += numberOfChecks;
                        console.log(line);
                        cli.verticalSpace();
                    }
                });
            });
        } else {
            console.log('Curently there are no Users!');
        }
    });
}

// More check info
cli.handlers.moreCheckInfo = (str) => {
    // Get ID from the string
    const arr = str.split('--');
    const checkId = typeof (arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;

    if(checkId) {
        
        // Lookup the check
        _data.read('checks', checkId, (err, checkData) => {
            if(!err && checkData) {                

                cli.verticalSpace();

                // Print the check data with text highlighting
                console.dir(checkData, {'colors': true});
                cli.verticalSpace();
            } else {
                console.log('Not a valid User!');
                cli.verticalSpace();
            }
        });
    }
}

// List logs
cli.handlers.listLogs = () => {
    
    // _logs.list(true, (err, logFileNames) => {

    //     if(!err && logFileNames && logFileNames.length > 0) {

    //         cli.verticalSpace();
    //         logFileNames.forEach(logFileName => {
    //             if(logFileName.indexOf('-') > -1) {
    //                 console.log(logFileName);
    //                 cli.verticalSpace();
    //             }
    //         });
    //     }
    // });

    // list logs using child process
    const ls = childProcess.spawn('ls', ['./.logs/']);

    // Add evnet listener on ls
    ls.stdout.on('data', dataObj => {
        // Explode into separate lines
        const dataStr = dataObj.toString();
        const logFileNames = dataStr.split('\n');
        cli.verticalSpace();
        logFileNames.forEach(logFileName => {
            if(typeof (logFileName) == 'string' && logFileName.length > 0 && logFileName.indexOf('-') > -1) {
                console.log(logFileName.trim().split('.')[0]);
                cli.verticalSpace();
            }
        });
    });
};

// More log info
cli.handlers.moreLogInfo = (str) => {
    // Get ID from the string
    const arr = str.split('--');
    const logFileName = typeof (arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;

    if(logFileName) {
        
        cli.verticalSpace();

        // Decompress the log
        _logs.decompress(logFileName, (err, logData) => {
            
            if(!err && logData) {

                // Split into lines of JSON string
                const jsonStringArray = logData.split('\n');

                jsonStringArray.forEach(jsonString => {
                    const logObject = helpers.parseJsonToObject(jsonString);

                    if(logObject && JSON.stringify(logObject) !== '{}') {
                        console.dir(logObject, {'colors': true});
                        cli.verticalSpace();
                    }
                });
            }
        });
    }
};

// Input processor
cli.processInput = str => {

    // Sanity check
    str = typeof (str) == 'string' && str.trim().length > 0 ? str.trim().toLowerCase() : false;

    // Only process the inout if the user actually wrote something, otherwise ignore it
    if (str) {
        // Codify the unique strings that identify the unique questions allowed to be asked
        const uniqueStrings = [
            'man',
            'help',
            'exit',
            'stats',
            'list users',
            'more user info',
            'list checks',
            'more check info',
            'list logs',
            'more log info'
        ];

        // Go through the possible input and emit an even when a match is found
        let matchFound = false;
        let counter = 0;

        uniqueStrings.some(input => {
            if (str.indexOf(input) > -1) {
                matchFound = true;

                // emit an even matching the unique input, and include the full string given by the user
                e.emit(input, str);
                return true;
            }
        });

        // If no match found, tell the user to try again
        if (!matchFound) {
            console.log('Sorry, try again!');
        }
    }
}

// Init Script
cli.init = () => {

    // Send the start message to the console, in dark blue
    console.log('\x1b[34m%s\x1b[0m', 'The CLI is running');

    // Strat the interface
    const _interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: ''
    });

    // Create an initial prompt
    _interface.prompt();

    // Handle each line of input separately
    _interface.on('line', str => {

        // Send to the input processor
        cli.processInput(str);

        // Re-initialize the prompt afterwards
        _interface.prompt();
    });

    // If the user stops the CLI, kill the associated process
    _interface.on('close', () => {
        process.exit(0);
    });
}


// Export the module
module.exports = cli;