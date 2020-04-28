/**
 *  API tests
 */

// Dependencies
const config = require('./../lib/config');
const app = require('./../index');
const http = require('http');
const assert = require('assert');
const AssertionError = assert.AssertionError;

// Holder for the tests
const api = {};


// Helpers
const helpers = {};

helpers.makeGetRequest = (path, done) => {

    // Configure the request details

    const requestDetails = {
        'protocol': 'http:',
        'hostname': 'localhost',
        'method': 'GET',
        'port': config.httpPort,
        'path': path,
        'headers': {
            'Content-Type': 'application/json'
        }
    };

    // Send the request
    const req = http.request(requestDetails, res => {
        done(res);
    });

    req.end();
};

// The main init function should run qithout throwing any error
api['api.init should start without throwing any error'] = (done) => {

    assert.doesNotThrow(() => {

        app.init(err => {
            done();
        });
    }, TypeError);
};

// Make a request to /ping
api['/ping should respond to GET with 200'] = (done) => {
    helpers.makeGetRequest('/ping', res => {
        assert.equal(res.statusCode, 200);
        done();
    });
};

// Make a request to /api/users
api['/api/users should respond to GET with 400'] = (done) => {

    helpers.makeGetRequest('/api/users', res => {
        assert.equal(res.statusCode, 400);
        done();
    });

};

// Make a request to a random path
api['A random path should respond to GET with 404'] = (done) => {

    helpers.makeGetRequest('/this/path/doesnt/exist', res => {
        debugger
        assert.equal(res.statusCode, 404);
        debugger
        done();
    });
};


// Export the tests to the Runner
module.exports = api;