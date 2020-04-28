/**
 *  Example HTTP2 Client
 * 
 */

// Dependencies
const http2 = require('http2');

// Create Client
const client = http2.connect('http://localhost:6000');

client.on('error', (err) => console.error(err));

// Create Request
const req = client.request({
    ':path': '/'
});

req.setEncoding('utf8');

// When a message is received, add the pieces of it together until end is reached
let str = '';
req.on('data', chunk => {
    str += chunk;
});

// When the message ends, log it out
req.on('end', () => {
    console.log(str);
    // client.close();
});

// End the request
req.end();