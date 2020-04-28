/**
 *  Library for storing and rotating logs
 */

// Dependencies
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const helpers = require('./helpers');

// Container for the module
const lib = {};

// Base directory for the logs folder
lib.baseDir = path.join(__dirname, '/../.logs/');

// Append the string to the file. Create the file if it doesn't exist.
lib.appned = (file, str, done) => {

    // Open the file for appending
    fs.open(`${lib.baseDir}${file}.log`, 'a', (err, fileDescriptor) => {
        if(!err && fileDescriptor) {

            // Append to the file and close it
            fs.appendFile(fileDescriptor, str+'\n', err => {
                if(!err) {

                    // Close the file
                    fs.close(fileDescriptor, err => {
                        if(!err) {
                            done(false);
                        } else {
                            done('Error closing file that was being appended');
                        }
                    });
                } else {
                    done('Error appending to the file');
                }
            });
        } else {
            done('Error opening the file for appending');
        }
    });
};

// List all the logs and optionally include the compressed log
lib.list = (includeCompressedLogs, done) => {

    // Read the .logs directory
    fs.readdir(lib.baseDir, (err, files) => {
        if(!err && files && files.length) {

            const trimmedFileNames = [];
            files.forEach(fileName => {

                // Add the .log files
                if(fileName.indexOf('.log') > -1) {
                    trimmedFileNames.push(fileName.replace('.log', ''));
                }

                // Add the .gz files
                if(fileName.indexOf('.gz.b64') > -1 && includeCompressedLogs) {
                    trimmedFileNames.push(fileName.replace('.gz.b64', ''));
                }
            });

            done(false, trimmedFileNames);
        } else {
            done(err, files);
        }
    });

};

// Compress the content of one .log file into a .gz.b64 file within the same directory
lib.compress = (logId, newFileId, done) => {

    const sourceFile = logId + '.log';
    const destFile = newFileId + '.gz.b64';

    // Read the source file
    fs.readFile(`${lib.baseDir}${sourceFile}`, 'utf8', (err, inputString) => {
        if(!err && inputString) {

            // Compress the data using gzip
            zlib.gzip(inputString, (err, buffer) => {
                if(!err && buffer) {

                    // Send the data to the destination file
                    fs.open(`${lib.baseDir}${destFile}`, 'wx', (err, fileDescriptor) => {
                        if(!err && fileDescriptor) {

                            // Write to the destination file
                            fs.writeFile(fileDescriptor, buffer.toString('base64'), err => {
                                if(!err) {
                                    // Close the destination file
                                    fs.close(fileDescriptor, err => {
                                        if(!err) {
                                            done(false);
                                        } else {
                                            done(err);
                                        }
                                    });
                                } else {
                                    done(err);
                                }
                            });
                        } else {
                            done(err);
                        }
                    });
                } else {
                    done(err);
                }
            });
        } else {
            done(err);
        }
    });
};

// Decompress the contents of a .gz.b64 file into a string variable
lib.decompress = (fileId, done) => {
    const fileName = fileId + '.gz.b64';

    fs.readFile(`${lib.baseDir}${fileName}`, 'utf8', (err, str) => {
        if(!err && str) {

            // Decompress the data
            const inputBuffer = Buffer.from(str, 'base64');
            zlib.unzip(inputBuffer, (err, outputBuffer) => {
                if(!err && outputBuffer) {
                    
                    // Callback
                    const outputString = outputBuffer.toString();
                    done(false, outputString);
                } else {
                    done(err);
                }
            });
        } else {
            done(err);
        }
    });
};

// Truncate a log file
lib.truncate = (logId, done) => {

    fs.truncate(`${lib.baseDir}${logId}.log`, 0, err => {

        if(!err) {
            done(false);
        } else {
            done(err);
        }
    });
};


// Export the module
module.exports = lib;