/**
 *  Example UDP Client
 *  Sending a mesage to a UDP Server on port 6000
 */

// Dependencies
const dgram = require('dgram');

// Create a Client
const client = dgram.createSocket('udp4');

// Define the message and pull it into a string
const msgString = 'This is a Mesage!';
const msgBuffer = Buffer.from(msgString);

// Send off the message
client.send(msgBuffer, 6000, 'localhost', err => {
    if(err) {
        console.error(err);
    } 
    client.close();
});