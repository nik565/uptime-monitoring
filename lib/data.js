/**
 * Library for storing and editing data
 * 
 */

// Dependencies
 const fs = require('fs');
 const path = require('path');
 const helpers = require('./helpers');

// Container for the module (to be exported)
const lib = {};

// Base directory for the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

// Write data to a file
lib.create = (dir, fileName, data, done) => {

    // Open the file for writing
    fs.open(`${lib.baseDir}${dir}/${fileName}.json`, 'wx', (err, fileDescriptor) => {
        if(!err && fileDescriptor) {
            // Convert data to string
            const stringData = JSON.stringify(data);

            // Write to file and close it
            fs.writeFile(fileDescriptor, stringData, err => {
                if(!err) {
                    fs.close(fileDescriptor, err => {
                        if(!err) {
                            done(false);
                        } else {
                            done('Error closing the file');
                        }
                    });
                } else {
                    done('Error writing to new file');
                }
            });
        } else {
            done('could not create file, it may exists!');
        }
    });
};

// Read data from a file
lib.read = (dir, fileName, done) => {
    
    // Open the file
    fs.readFile(`${lib.baseDir}${dir}/${fileName}.json`, 'utf8', (err, data) => {
        if(!err && data) {
            done(false, helpers.parseJsonToObject(data));
        } else {
            done(err, data);
        }
    });
};

// Update data inside a file
lib.update = (dir, fileName, data, done) => {

    // Open the file
    fs.open(`${lib.baseDir}${dir}/${fileName}.json`, 'r+', (err, fileDescriptor) => {
        if(!err && fileDescriptor) {

            // Convert data to string
            const stringData = JSON.stringify(data);

            // Truncate the file
            fs.ftruncate(fileDescriptor, err => {
                if(!err) {
                    // Write to the file and close it
                    fs.writeFile(fileDescriptor, stringData, err => {
                        if(!err) {
                            fs.close(fileDescriptor, err => {
                                if(!err) {
                                    done(false);
                                } else {
                                    done('Error closing the file');
                                }
                            });
                        } else {
                            done('Error writing to existing file');
                        }
                    });
                } else {
                    done('Error truncating file');
                }
            });
        } else {
            done('Could not open the file for updating, it may not exist yet');
        }
    });
};

// Delete a file
lib.delete = (dir, fileName, done) => {

    // Unlink the file
    fs.unlink(`${lib.baseDir}${dir}/${fileName}.json`, err => {
        if(!err) {
            done(false);
        } else {
            done('Error deleting filre');
        }
    });
};

lib.phoneNumbers = {
    'Swagat': '7609928266',
    'Nikhil': '7209400366'
};

// List all the items in a directory
lib.list = (dir, done) => {

    fs.readdir(`${lib.baseDir}${dir}/`, (err, data) => {
        if(!err && data && data.length > 0) {
            let trimmedFileNames = [];
            data.forEach(fileName => {
                trimmedFileNames.push(fileName.replace('.json', ''));
            });
            done(false, trimmedFileNames);
        } else {
            done(err, data);
        }
    });
}

 // Export the module
module.exports = lib;