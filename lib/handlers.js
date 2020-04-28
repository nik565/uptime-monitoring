/**
 *  Request handlers
 */

// Dependencies
const _data = require('../lib/data');
const helpers = require('./helpers');
const config = require('./config');
const _url = require('url');
const dns = require('dns');
const util = require('util');
const { performance, PerformanceObserver } = require('perf_hooks');
const debug = util.debuglog('performance');

// Log all the measurements of performance marks (in ms)
const obs = new PerformanceObserver(items => {
    items.getEntries().forEach(item => {
        debug('\x1b[33m%s\x1b[0m', item.name + ' ' + item.duration);
    });
});

obs.observe({ entryTypes: ['measure'] });

//Define the handler
const handlers = {};

/**
 *  HTML Handlers
 */

// Index handler
handlers.index = (data, done) => {

    // Reject any request that isn't a GET
    if (data.method == 'get') {

        // Prepare data for interpolation
        const templateData = {
            'head.title': 'Uptime Monitoring - Made Simple',
            'head.description': `We offer free simple uptime monitoring for HTTP/HTTPS sites of all kinds, when your site goes down we'll send you a text to let you know.`,
            'body.class': 'index'
        };

        // Get template as a string
        getTemplate('index', templateData, done);
    } else {
        done(405, undefined, 'html');
    }
}

// Create Account
handlers.accountCreate = (data, done) => {

    // Reject any request that isn't a GET
    if (data.method == 'get') {

        // Prepare data for interpolation
        const templateData = {
            'head.title': 'Create an account',
            'head.description': 'Sign up is easy and only takes a few seconds.',
            'body.class': 'accountCreate'
        };

        // Get template as a string
        getTemplate('accountCreate', templateData, done);
    } else {
        done(405, undefined, 'html');
    }
}

// Create New Session
handlers.sessionCreate = (data, done) => {

    // Reject any request that isn't a GET
    if (data.method == 'get') {

        // Prepare data for interpolation
        const templateData = {
            'head.title': 'Login to your Account',
            'head.description': 'Please enter your phone number and password to access your account.',
            'body.class': 'sessionCreate'
        };

        // Get template as a string
        getTemplate('sessionCreate', templateData, done);
    } else {
        done(405, undefined, 'html');
    }
}

// Session has been deleted
handlers.sessionDeleted = (data, done) => {

    // Reject any request that isn't a GET
    if (data.method == 'get') {

        // Prepare data for interpolation
        const templateData = {
            'head.title': 'Logged Out',
            'head.description': 'You have been logged out of your account.',
            'body.class': 'sessionDeleted'
        };

        // Get template as a string
        getTemplate('sessionDeleted', templateData, done);
    } else {
        done(405, undefined, 'html');
    }
}

// Edit your account
handlers.accountEdit = (data, done) => {

    // Reject any request that isn't a GET
    if (data.method == 'get') {

        // Prepare data for interpolation
        const templateData = {
            'head.title': 'Account Edit',
            'body.class': 'accountEdit'
        };

        // Get template as a string
        getTemplate('accountEdit', templateData, done);
    } else {
        done(405, undefined, 'html');
    }
}

// Account has been deleted
handlers.accountDeleted = (data, done) => {

    // Reject any request that isn't a GET
    if (data.method == 'get') {

        // Prepare data for interpolation
        const templateData = {
            'head.title': 'Account Deleted',
            'head.description': 'Your account has been deleted',
            'body.class': 'accountDeleted'
        };

        // Get template as a string
        getTemplate('accountDeleted', templateData, done);
    } else {
        done(405, undefined, 'html');
    }
}

// Create a new check
handlers.checksCreate = (data, done) => {

    // Reject any request that isn't a GET
    if (data.method == 'get') {

        // Prepare data for interpolation
        const templateData = {
            'head.title': 'Create a new Check',
            'body.class': 'checksCreate'
        };

        // Get template as a string
        getTemplate('checksCreate', templateData, done);
    } else {
        done(405, undefined, 'html');
    }
}

// Dashboard (view all checks)
handlers.checksList = (data, done) => {

    // Reject any request that isn't a GET
    if (data.method == 'get') {

        // Prepare data for interpolation
        const templateData = {
            'head.title': 'Dashboard',
            'body.class': 'checksList'
        };

        // Get template as a string
        getTemplate('checksList', templateData, done);
    } else {
        done(405, undefined, 'html');
    }
}

// Edit a check
handlers.checksEdit = (data, done) => {

    // Reject any request that isn't a GET
    if (data.method == 'get') {

        // Prepare data for interpolation
        const templateData = {
            'head.title': 'Check Details',
            'body.class': 'checksEdit'
        };

        // Get template as a string
        getTemplate('checksEdit', templateData, done);
    } else {
        done(405, undefined, 'html');
    }
}

// Favicon
handlers.favicon = (data, done) => {

    // Reject any request that isn't a GET
    if (data.method == 'get') {

        // Read in favicon's data
        helpers.getStaticAsset('favicon.ico', (err, data) => {

            if (!err && data) {

                done(200, data, 'favicon');
            } else {
                done(500);
            }
        });
    } else {
        done(405);
    }
}

// Public assets
handlers.public = (data, done) => {

    // Reject any request that isn't a GET
    if (data.method == 'get') {

        // Get the fileName being requested
        const trimmedAssestName = data.trimmedPath.replace('public/', '').trim();
        if (trimmedAssestName.length > 0) {

            // Read in the asset's data
            helpers.getStaticAsset(trimmedAssestName, (err, data) => {

                if (!err && data) {

                    // Determine the content type (defaut to plain text)
                    let contentType = 'plain';

                    if (trimmedAssestName.indexOf('.css') > -1) {
                        contentType = 'css';
                    }

                    if (trimmedAssestName.indexOf('.png') > -1) {
                        contentType = 'png';
                    }

                    if (trimmedAssestName.indexOf('.jpg') > -1) {
                        contentType = 'jpg';
                    }

                    if (trimmedAssestName.indexOf('.ico') > -1) {
                        contentType = 'favicon';
                    }

                    // Return the data
                    done(200, data, contentType);
                } else {
                    done(404);
                }
            });
        } else {
            done(404);
        }
    } else {
        done(405);
    }
}


/**
 *  JSON API handlers
 */

// Example error
handlers.exampleError = (data, done) => {
    const error = new Error('This is an Example error');
    throw (error);
}

// Users handler
handlers.users = (data, done) => {
    const acceptableMethods = ['post', 'get', 'delete', 'put'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, done);
    } else {
        done(405);
    }
};

// Container for the users submethods
handlers._users = {};

// Users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = (data, done) => {

    // Check that all required fields are filled out
    const firstName = typeof (data.payload.firstName) == 'string' &&
        data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof (data.payload.lastName) == 'string' &&
        data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const password = typeof (data.payload.password) == 'string' &&
        data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    const phone = typeof (data.payload.phone) == 'string' &&
        data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    const tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' &&
        data.payload.tosAgreement === true ? data.payload.tosAgreement : false;

    if (firstName && lastName && phone && tosAgreement) {

        // Make sure the user doesn't already exist
        _data.read('users', phone, (err, data) => {
            if (err) {
                // Hash the password
                const hashedPassword = helpers.hash(password);
                if (hashedPassword) {
                    // Create the user Object
                    const userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'password': hashedPassword,
                        'phone': phone,
                        'tosAgreement': true
                    };

                    // Strore the user
                    _data.create('users', phone, userObject, err => {
                        if (!err) {
                            done(200);
                        } else {
                            console.log(err);
                            done(500, { 'Error': 'Could not create the new user' });
                        }
                    });
                } else {
                    done(500, { 'Error': 'Could hash the user\'s password' });
                }
            } else {
                done(400, { 'Error': 'A user with that phone number already exists!' });
            }
        });

    } else {
        done(400, { 'Error': 'Missing required fields' });
    }

};

// Users - get
// Requires data: phone
// Optional data: none
handlers._users.get = (data, done) => {

    // Check that the phone number provided is valid
    const phone = typeof (data.queryStringObject.phone) == 'string' &&
        data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;

    if (phone) {

        // Get the token from the headers
        const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

        // Verfiy that the given token is valid for the given user
        handlers._tokens.verify(token, phone, tokenIsValid => {
            if (tokenIsValid) {
                // Lookup the user
                _data.read('users', phone, (err, data) => {
                    if (!err && data) {
                        // Remove the hashed password from the user object before returning it to the requester
                        delete data.password;
                        done(200, data);
                    } else {
                        done(404);
                    }
                });
            } else {
                done(403, { 'Error': 'Missing required token in header or the token is invalid' });
            }
        });
    } else {
        done(400, { 'Error': 'Missing required field' });
    }
};

// Users - put
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be present)
handlers._users.put = (data, done) => {

    // Check for the required field
    const phone = typeof (data.payload.phone) == 'string' &&
        data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    // Check for optional field
    const firstName = typeof (data.payload.firstName) == 'string' &&
        data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof (data.payload.lastName) == 'string' &&
        data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const password = typeof (data.payload.password) == 'string' &&
        data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    // Error if phone is invalid
    if (phone) {
        // Error if nothing is sent to update
        if (firstName || lastName || password) {

            // Get the token from the headers
            const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

            // Verfiy that the given token is valid for the given user

            handlers._tokens.verify(token, phone, tokenIsValid => {
                if (tokenIsValid) {
                    // Lookup the user
                    _data.read('users', phone, (err, userData) => {
                        if (!err && userData) {
                            // update the fields necessary
                            if (firstName) {
                                userData.firstName = firstName;
                            }
                            if (lastName) {
                                userData.lastName = lastName;
                            }
                            if (password) {
                                userData.password = helpers.hash(password);
                            }

                            // Store the new updates
                            _data.update('users', phone, userData, err => {
                                if (!err) {
                                    done(200);
                                } else {
                                    console.log(err);
                                    done(500, { 'Error': 'Could not update the user' });
                                }
                            });
                        } else {
                            done(400, { 'Error': 'The specified user doesn\'t exist' });
                        }
                    });
                } else {
                    done(403, { 'Error': 'Missing required token in header or the token is invalid' });
                }
            })

        } else {
            done(400, { 'Error': 'Missing fields to update' });
        }
    } else {
        done(400, { 'Error': 'Missing required field' });
    }
};

// Users - delete
// Required data: phone
handlers._users.delete = (data, done) => {

    // Check for the required field
    const phone = typeof (data.queryStringObject.phone) == 'string' &&
        data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;

    if (phone) {

        // Get the token from the headers
        const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

        // Verfiy that the given token is valid for the given user
        handlers._tokens.verify(token, phone, tokenIsValid => {
            if (tokenIsValid) {
                // Check if User exists
                _data.read('users', phone, (err, userData) => {
                    if (!err && userData) {
                        // Delete the user
                        _data.delete('users', phone, err => {
                            if (!err) {

                                // Delete each of the checks associated with the user
                                const userChecks = typeof (userData.checks) == 'object' &&
                                    userData.checks instanceof Array ? userData.checks : [];
                                const checksToDelete = userChecks.length;

                                if (checksToDelete > 0) {
                                    let deletionErrors = false;
                                    let checksDeleted = 0;
                                    userChecks.forEach(checkId => {
                                        _data.delete('checks', checkId, err => {
                                            if (err) {
                                                deletionErrors = true;
                                            }
                                            checksDeleted++;
                                            if (checksDeleted == checksToDelete) {
                                                if (!deletionErrors) {
                                                    done(200);
                                                } else {
                                                    done(500, { 'Error': 'Errors encountered while atempting to delete user\'s checks, all checks may not have been deleted from the system' });
                                                }
                                            }
                                        });
                                    });
                                } else {
                                    done(200);
                                }
                            } else {
                                done(500, { 'Error': 'Couldn\'t delete the specified user' });
                            }
                        });
                    } else {
                        done(400, { 'Error': 'The specified user doesn\'t exist' });
                    }
                });
            } else {
                done(403, { 'Error': 'Missing required token in header or the token is invalid' });
            }
        });
    } else {
        done(400, { 'Error': 'Missing required field' });
    }
};

// tokens haldnler
handlers.tokens = (data, done) => {
    const acceptableMethods = ['post', 'get', 'delete', 'put'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, done);
    } else {
        done(405);
    }
};

// Container for all the tokens submethod
handlers._tokens = {};

// tokens - post
// Required data : phone, password
// Optional data : none
handlers._tokens.post = (data, done) => {

    performance.mark('entered tokens post function');

    // Check for the required fields
    const password = typeof (data.payload.password) == 'string' &&
        data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    const phone = typeof (data.payload.phone) == 'string' &&
        data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    performance.mark('inputs validated');

    if (phone && password) {

        performance.mark('beginning user lookup');
        // Lookup the user
        _data.read('users', phone, (err, userData) => {

            performance.mark('user lookup completed');

            if (!err && userData) {

                performance.mark('beginning password hashing');
                // Hash the password
                const hashedPassword = helpers.hash(password);
                performance.mark('password hashing completed');
                if (hashedPassword == userData.password) {

                    performance.mark('creating data for the token');
                    // If valid, Generate a new token with random name, and set the expiry of 1 hour in future
                    const tokenId = helpers.createRandomString(20);
                    performance.mark('token data creation completed');
                    const expires = Date.now() + 1000 * 60 * 60;
                    const tokenObject = {
                        'phone': phone,
                        'id': tokenId,
                        'expires': expires
                    };

                    performance.mark('beginning storing token');

                    // Strore the token
                    _data.create('tokens', tokenId, tokenObject, err => {

                        performance.mark('storing token completed');

                        // Gather all the measurements
                        performance.measure('Token post beginning to end',
                            'entered tokens post function',
                            'storing token completed'
                        );

                        performance.measure('Validating user input',
                            'entered tokens post function',
                            'inputs validated'
                        );

                        performance.measure('User lookup',
                            'beginning user lookup',
                            'user lookup completed'
                        );

                        performance.measure('Password hashing',
                            'beginning password hashing',
                            'password hashing completed'
                        );

                        performance.measure('Token data creation',
                            'creating data for the token',
                            'token data creation completed'
                        );

                        performance.measure('Token storing',
                            'beginning storing token',
                            'storing token completed'
                        );

                        if (!err) {
                            done(200, tokenObject);
                        } else {
                            done(500, { 'Error': 'Could not create the token' });
                        }
                    });
                } else {
                    done(400, { 'Error': 'Password did not match' });
                }
            } else {
                done(400, { 'Error': 'Could not find the specified user' });
            }
        });
    } else {
        done(400, { 'Error': 'Missing required fields' });
    }
};

// tokens - get
// Required data: id
// Optional data: none
handlers._tokens.get = (data, done) => {

    // Check if the id is valid
    const id = typeof (data.queryStringObject.id) == 'string' &&
        data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id : false;

    if (id) {

        // Look up the token
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                done(200, tokenData);
            } else {
                done(404);
            }
        });
    } else {
        done(400, { 'Error': 'Missing required fields' });
    }
};

// tokens - put
// Required data: id, extend
// Optional data: none
handlers._tokens.put = (data, done) => {

    // Sanity check the payload
    const id = typeof (data.payload.id) == 'string' &&
        data.payload.id.trim().length == 20 ? data.payload.id : false;
    const extend = typeof (data.payload.extend) == 'boolean' &&
        data.payload.extend == true ? true : false;

    if (id && extend) {

        // Look up the token
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                // Check to make sure that token isn't already expired
                if (tokenData.expires > Date.now()) {
                    //  Set the expiration an hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60;
                    // Store the new token
                    _data.update('tokens', id, tokenData, err => {
                        if (!err) {
                            done(200);
                        } else {
                            done(500, { 'Error': 'Could not update the token\'s expiration' });
                        }
                    });
                } else {
                    done(400, { 'Error': 'The token has already expired and cannnot be extended' });
                }
            } else {
                done(400, { 'Error': 'The specified token does not exsit' });
            }
        });
    } else {
        done(400, { 'Error': 'Missing required field(s) or field(s) are invalid' });
    }
};

// tokens - delete
// Required data: id
// Optional data: none
handlers._tokens.delete = (data, done) => {

    // Sanity check the id
    const id = typeof (data.queryStringObject.id) == 'string' &&
        data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

    if (id) {

        // Look up the token
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {

                // Delete the token
                _data.delete('tokens', id, err => {
                    if (!err) {
                        done(200);
                    } else {
                        done(500, { 'Error': 'Could not delete the token' });
                    }
                })
            } else {
                done(400, { 'Error': 'The specified token does not exist' });
            }
        })
    } else {
        done(400, { 'Error': 'Missing required field' });
    }
};

// Verify that a given token id is currently valid for a given user
handlers._tokens.verify = (id, phone, done) => {

    // Lookup the token
    _data.read('tokens', id, (err, tokenData) => {

        if (!err && tokenData) {
            // Check that the token is for the given user and has not expired
            if (tokenData.phone == phone && tokenData.expires > Date.now()) {
                done(true);
            } else {
                done(false);
            }
        } else {
            done(false);
        }
    });
};

// Checks handler
handlers.checks = (data, done) => {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._checks[data.method](data, done);
    } else {
        done(405);
    }
};

// Container for all checks methods
handlers._checks = {};

// Checks - post
// Required data: protocol, url, method, successCodes, tomeoutSeconds
// Optional data: none
handlers._checks.post = (data, done) => {

    // Sanity check the input
    const protocol = typeof (data.payload.protocol) == 'string' &&
        ['https', 'http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    const url = typeof (data.payload.url) == 'string' &&
        data.payload.url.trim().length > 0 ? data.payload.url : false;
    const method = typeof (data.payload.method) == 'string' &&
        ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    const successCodes = typeof (data.payload.successCodes) == 'object' &&
        data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
    const timeoutSeconds = typeof (data.payload.timeoutSeconds) == 'number' &&
        data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

    if (protocol && url && method && successCodes && timeoutSeconds) {

        // Get the token from the headers
        const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

        // Lookup the user by reading the token
        _data.read('tokens', token, (err, tokenData) => {
            if (!err && tokenData) {
                const userPhone = tokenData.phone;

                // Lookup the user data
                _data.read('users', userPhone, (err, userData) => {
                    if (!err && userData) {
                        const userChecks = typeof (userData.checks) == 'object' &&
                            userData.checks instanceof Array ? userData.checks : [];

                        // Verify that user has less than number of max-checks-per-user
                        if (userChecks.length < config.maxChecks) {

                            // Verify that the URL given has dns entries (and therefore can resolve)
                            const parsedUrl = _url.parse(`${protocol}://${url}`, true);
                            const hostName = typeof (parsedUrl.hostname) == 'string' && parsedUrl.hostname.length > 0 ?
                                parsedUrl.hostname : false;

                            dns.resolve(hostName, (err, records) => {
                                if (!err && records) {
                                    // Create a random id for the check
                                    const checkId = helpers.createRandomString(20);

                                    // Create a random check and include user's phone
                                    const checkObject = {
                                        'id': checkId,
                                        'userPhone': userPhone,
                                        'protocol': protocol,
                                        'url': url,
                                        'method': method,
                                        'successCodes': successCodes,
                                        'timeoutSeconds': timeoutSeconds
                                    };

                                    // Save the check object
                                    _data.create('checks', checkId, checkObject, err => {
                                        if (!err) {
                                            // Add the check id to the user object
                                            userData.checks = userChecks;
                                            userData.checks.push(checkId);

                                            // Save the new user object
                                            _data.update('users', userPhone, userData, err => {
                                                if (!err) {
                                                    // Return the data about the new checks
                                                    done(200, checkObject);
                                                } else {
                                                    done(500, { 'Error': 'Could not update the user with the new check' });
                                                }
                                            });
                                        } else {
                                            done(500, { 'Error': 'Could not create the new check' });
                                        }
                                    });
                                } else {
                                    done(400, { 'Error': 'The hostname of the URL entered did not resolve to any DNS entries' });
                                }
                            });
                        } else {
                            done(400, { 'Error': `The user already has the maximum number of checks (${config.maxChecks})` });
                        }
                    } else {
                        done(403);
                    }
                });
            } else {
                done(403);
            }
        });
    } else {
        done(400, { 'Error': 'Missing required inputs or inouts are invalid' });
    }
};

// Checks - get
// Required data: id
// Optional data: none
handlers._checks.get = (data, done) => {

    // Sanity check the input
    const id = typeof (data.queryStringObject.id) == 'string' &&
        data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id : false;

    if (id) {

        // Look up the check
        _data.read('checks', id, (err, checkData) => {
            if (!err && checkData) {

                // Get the token from the header
                const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

                // Verify that the given token is valid and belongs to the user who created this check
                handlers._tokens.verify(token, checkData.userPhone, tokenIsValid => {
                    if (tokenIsValid) {

                        // Return the check data
                        done(200, checkData);
                    } else {
                        done(403);
                    }
                });
            } else {
                done(404, { 'Error': 'Check does not exist' });
            }
        });
    } else {
        done(400, { 'Error': 'Missing required fields' });
    }
};

// Checks - put
// Required data: id
// optional data: protocol, method, url, successCodes, tomeoutSeconds (one must be sent)
handlers._checks.put = (data, done) => {

    // Check for the required field
    const id = typeof (data.payload.id) == 'string' &&
        data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;

    // Check for optional field
    const protocol = typeof (data.payload.protocol) == 'string' &&
        ['https', 'http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    const url = typeof (data.payload.url) == 'string' &&
        data.payload.url.trim().length > 0 ? data.payload.url : false;
    const method = typeof (data.payload.method) == 'string' &&
        ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    const successCodes = typeof (data.payload.successCodes) == 'object' &&
        data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
    const timeoutSeconds = typeof (data.payload.timeoutSeconds) == 'number' &&
        data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

    // Make sure id is valid
    if (id) {

        // Make sure one of the optional field is sent
        if (protocol || url || method || successCodes || timeoutSeconds) {

            // Look up the check
            _data.read('checks', id, (err, checkData) => {
                if (!err && checkData) {

                    // Grab the token from the header
                    const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
                    // Verify that the token is valid and belongs to the user  who created the check
                    handlers._tokens.verify(token, checkData.userPhone, isTokenValid => {
                        if (isTokenValid) {

                            // Update the check data where necessary
                            if (protocol) {
                                checkData.protocol = protocol;
                            }
                            if (url) {
                                checkData.url = url;
                            }
                            if (method) {
                                checkData.method = method;
                            }
                            if (successCodes) {
                                checkData.successCodes = successCodes;
                            }
                            if (timeoutSeconds) {
                                checkData.timeoutSeconds = timeoutSeconds;
                            }

                            // Update the new check data
                            _data.update('checks', id, checkData, err => {
                                if (!err) {
                                    done(200, checkData);
                                } else {
                                    done(500, { 'Error': 'Could not update the check' });
                                }
                            })
                        } else {
                            done(403);
                        }
                    });
                } else {
                    done(400, { 'Error': 'Check id did not exist' });
                }
            });
        } else {
            done(400, { 'Error': 'Missing field to update' });
        }
    } else {
        done(400, { 'Error': 'Missing required fields' });
    }
};

// Checks - delete
// Required data: id
// Optional data: none
handlers._checks.delete = (data, done) => {

    // Check for the required field
    const id = typeof (data.queryStringObject.id) == 'string' &&
        data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

    if (id) {

        // Look up the check
        _data.read('checks', id, (err, checkData) => {

            if (!err && checkData) {

                // Grab the token from the haeder
                const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

                // Verify the token is valid and belongs to the user who created the check
                handlers._tokens.verify(token, checkData.userPhone, tokenIsValid => {

                    if (tokenIsValid) {

                        // Delete the check
                        _data.delete('checks', id, err => {
                            if (!err) {

                                // Look uo the user and modify their check data
                                _data.read('users', checkData.userPhone, (err, userData) => {
                                    if (!err && userData) {
                                        const userChecks = typeof (userData.checks) == 'object' &&
                                            userData.checks instanceof Array ? userData.checks : [];

                                        // Remove the deleted checks from their deleted checks
                                        const checkPosition = userChecks.indexOf(id);
                                        if (checkPosition > -1) {
                                            userChecks.splice(checkPosition, 1);

                                            // Re-save the user data
                                            _data.update('users', checkData.userPhone, userData, err => {
                                                if (!err) {
                                                    done(200);
                                                } else {
                                                    done(500, { 'Error': 'Could not delete the check from user\'s check list' });
                                                }
                                            });
                                        } else {
                                            done(500, { 'Error': 'check id is missing in user\'s check list' });
                                        }

                                    } else {
                                        done(500, { 'Error': 'Could not find the user who created the check hence could not update the user\'s checks data' });
                                    }
                                })
                            } else {
                                done(500, { 'Error': 'Could nit delete the check' });
                            }
                        });
                    } else {
                        done(403, { 'Error': 'Missing required token or token is not valid' });;
                    }
                });
            } else {
                done(400, { 'Error': 'The given check id does not exist' });
            }
        });
    } else {
        done(400, { 'Error': 'Missing required field' });
    }
};

// ping handler
handlers.ping = (data, done) => {
    // send back http status code, payload
    done(200);
};

// Not Found Handler
handlers.notFound = (data, done) => {
    done(404, { 'Error': 'Page Not Found' });
};

// Generic method to get Template
const getTemplate = (templateName, templateData, done) => {

    // Read in a template as a string
    helpers.getTemplate(templateName, templateData, (err, str) => {

        // Add universal header and footer
        if (!err && str) {

            helpers.addUniversalTemplates(str, templateData, (err, pageString) => {

                if (!err && pageString) {

                    // Return that page as HTML
                    done(200, pageString, 'html');
                } else {
                    done(500, undefined, 'html');
                }
            });
        } else {
            done(500, undefined, 'html');
        }
    });
};

// export the module
module.exports = handlers;