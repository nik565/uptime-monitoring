/**
 *  Example TCP (Net) Server
 *  Listens to port 6000, and send the work "pong" to clients
 */

// Dependencies
const net = require('net');

// Create a server
const server = net.createServer(connection => {
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