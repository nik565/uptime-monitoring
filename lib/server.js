/**
 *  Server-related tasks
 * 
 */

//Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');
const handlers = require('./handlers');
const helpers = require('./helpers');
const data = require('./data');
const path = require('path');
const util = require('util');
const debug = util.debuglog('server');

// // TODO: - get rid of this
// helpers.sendTwilioSms(data.phoneNumers.Swagat, 'Hello! From Nikhil Ojha', err => {
//     console.log('This was the error: ', err);
// });

// Instantiate the server module object
const server = {};

// Instantiate the HTTP server
const httpServer = http.createServer((req, res) => {
    unifiedServer(req, res);
});

// Instantiate the HTTPS server
const httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};

const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req, res);
});

// Define the request router
const router = {
    '': handlers.index,
    'account/create': handlers.accountCreate,
    'account/edit': handlers.accountEdit,
    'account/deleted': handlers.accountDeleted,
    'session/create': handlers.sessionCreate,
    'session/deleted': handlers.sessionDeleted,
    'checks/all': handlers.checksList,
    'checks/create': handlers.checksCreate,
    'checks/edit': handlers.checksEdit,
    'ping': handlers.ping,
    'api/users': handlers.users,
    'api/tokens': handlers.tokens,
    'api/checks': handlers.checks,
    'favicon.ico': handlers.favicon,
    'public': handlers.public,
    'examples/error': handlers.exampleError
};

// All the server logic for both HTTP server and HTTPS server
const unifiedServer = (req, res) => {

    //Get the url and parse it
    const parsedUrl = url.parse(req.url, true);

    //Get the path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    //Get the query string as an object
    const queryStringObject = parsedUrl.query;

    // Get the HTTP method
    const method = req.method.toLowerCase();

    //Get the headers
    const headers = req.headers;

    // Get the payload, if any
    const decoder = new StringDecoder('utf-8');
    let buffer = '';

    req.on('data', data => {
        buffer += decoder.write(data);
    });
    req.on('end', () => {
        buffer += decoder.end();

        //Choose the handler this request should go. If one is not found then use the notFound handler
        let choosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // If the request is within public directory, choose the public handler instead
        choosenHandler = trimmedPath.indexOf('public/') > -1 ? handlers.public : choosenHandler;

        //Construct the data object to send to the handler
        const data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers
        };
        if (buffer.trim().length > 0) {
            data.payload = helpers.parseJsonToObject(buffer);
        }

        //Route the request specidied in the router
        try {
            choosenHandler(data, (statusCode, payload, contentType) => {

                server.processResponseHandler(res, method, trimmedPath, statusCode, payload, contentType);
            });
        } catch (error) {
            debugger
            debug(error);
            debugger
            server.processResponseHandler(res, method, trimmedPath, 500, { 'Error': 'An unknown error has occurred' }, 'json');
        }
    });
};

// Process the response from the handler
server.processResponseHandler = (res, method, trimmedPath, statusCode, payload, contentType) => {

    // Determine the type of response (fallback to JSON)
    contentType = typeof (contentType) == 'string' ? contentType : 'json';

    // Use the statusCode called back by the handler, or default to 200
    statusCode = typeof (statusCode) == 'number' ? statusCode : 200;

    // Return the response-parts that are content-specific
    let payloadString = '';
    if (contentType == 'json') {

        res.setHeader('Content-Type', 'application/json');
        payload = typeof (payload) == 'object' ? payload : {};
        payloadString = JSON.stringify(payload);
    }

    if (contentType == 'html') {

        res.setHeader('Content-Type', 'text/html');
        payloadString = typeof (payload) == 'string' ? payload : '';
    }

    if (contentType == 'favicon') {

        res.setHeader('Content-Type', 'image/x-icon');
        payloadString = typeof (payload) !== 'undefined' ? payload : '';
    }

    if (contentType == 'css') {

        res.setHeader('Content-Type', 'text/css');
        payloadString = typeof (payload) !== 'undefined' ? payload : '';
    }

    if (contentType == 'png') {

        res.setHeader('Content-Type', 'image/png');
        payloadString = typeof (payload) !== 'undefined' ? payload : '';
    }

    if (contentType == 'jpg') {

        res.setHeader('Content-Type', 'image/jpeg');
        payloadString = typeof (payload) !== 'undefined' ? payload : '';
    }

    if (contentType == 'plain') {

        res.setHeader('Content-Type', 'text/plain');
        payloadString = typeof (payload) !== 'undefined' ? payload : '';
    }

    // Return the resposne-parts that are common to all content-types
    res.writeHead(statusCode);
    res.end(payloadString);

    // If the response is 200, print in green otherwise in red
    if (statusCode == 200) {
        debug('\x1b[32m%s\x1b[0m', `${method.toUpperCase()} /${trimmedPath} ${statusCode}`);
    } else {
        debug('\x1b[31m%s\x1b[0m', `${method.toUpperCase()} /${trimmedPath} ${statusCode}`);
    }
}

// Server initialization
server.init = () => {

    // Start the HTTP server
    httpServer.listen(config.httpPort, () => {

        // Send to console, in blue
        console.log('\x1b[36m%s\x1b[0m', `HTTP Server is listening on port ${config.httpPort}`);
    });

    // Start the HTTPS server
    httpsServer.listen(config.httpsPort, () => {

        // Send to console, in pink
        console.log('\x1b[35m%s\x1b[0m', `HTTPS Server is listening on port ${config.httpsPort}`);
    });
}

// Export the server module
module.exports = server;