/**
 *  Example TLS Client
 *  Connects to port 6000, and sends the word "ping" to server
 */

// Dependencies
const tls = require('tls');
const fs = require('fs');
const path = require('path');

// Server options
const options = {
    'ca': fs.readFileSync(path.join(__dirname, '/../https/cert.pem')) // Only required because we are using self-signed certificate
};

// Define the message to send
const outboundMessage = 'ping';

// Create the client
const client = tls.connect(6000, options, () => {
    // Send the message
    client.write(outboundMessage);
});

client.on('secureConnect', () => {
    console.log('Established a secure connection!');
});

// client.on('keylog', line => {
//     console.log('Session: ', line.toString());
// });

// client.on('session', session => {
//     console.log('Session: ', session.toJSON());
// });

// When the server writes back, log what it says then kill the client
client.on('data', inboundMessage => {
    const msgString = inboundMessage.toString();
    console.log(`I wrote ${outboundMessage} and they said ${inboundMessage}`);
    client.end();
})