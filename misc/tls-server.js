/**
 *  Example TLS Server (Subset of 'net' module)
 *  Listens to port 6000, and send the work "pong" to clients
 */

// Dependencies
const tls = require('tls');
const fs = require('fs');
const path = require('path');

// Server options
const options = {
    'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};

// Create a server
const server = tls.createServer(options, connection => {
    // Send the word "pong"
    const outboundMessage = 'pong';
    connection.write(outboundMessage);

    // When the clients write something, log it out
    connection.on('data', inboundMessage => {
        const msgString = inboundMessage.toString();
        console.log(`I wrote ${outboundMessage} and they said ${inboundMessage}`);
    });
});

// Listen
server.listen(6000);