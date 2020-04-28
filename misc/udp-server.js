/**
 *  Example UDP Server
 *  Creating a UDP datagram server listening on 6000
 */

// Dependencies
const dgram = require('dgram');

// Create a Server
const server = dgram.createSocket('udp4');

server.on('message', (msgBuffer, rinfo) => {
    // Do something with the incoming message, or do something with the sender
    const msgString = msgBuffer.toString();
    console.log(msgString);
});

// bind to 6000
server.bind(6000);