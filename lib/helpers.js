/**
 *  Helpers for varios tasks
 */

//Dependencies
const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const queryString = require('querystring');
const path = require('path');
const fs = require('fs');

const name = 'jihn';

// Container for all helpers
const helpers = {};

// Sample for testing that simply returns a number
helpers.getANumber = () => 1;

// Create a SHA256 hash
helpers.hash = str => {
    if (typeof (str) == 'string' && str.length > 0) {
        return crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    } else {
        return false;
    }
};

// Parse a JSON string to an object in all cases, without thrwing any error
helpers.parseJsonToObject = str => {
    try {
        return JSON.parse(str);
    } catch (error) {
        return {};
    }
};

// Generate a string of random alphanumeric characters, of a given length
helpers.createRandomString = strLength => {

    // Sanity check of strLength
    strLength = typeof (strLength) == 'number' && strLength > 0 ? strLength : false;

    if (strLength) {

        // Define all possible characters that could go in to the string
        const possibleCharactersString = 'abcdefghijklmnopqrstuvwxyz0123456789';

        // Start the final string
        let str = '';
        let count = 0;
        while (count < 20) {
            // Get a random character from the possibleCharacters string
            const randomSCharacter = possibleCharactersString.charAt(Math.floor(Math.random() * possibleCharactersString.length));
            // Append this chracter to the final string
            str += randomSCharacter;
            count++;
        }

        // Return the string;
        return str;
    } else {
        return false;
    }

};

// Send an SMS message vai Twilio
helpers.sendTwilioSms = (phone, msg, done) => {

    // Verify the inputs
    phone = typeof (phone) == 'string' && phone.trim().length == 10 ? phone : false;
    msg = typeof (msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg : false;

    if (phone && msg) {

        // Configure the request payload
        const payload = {
            'From': config.twilio.fromPhone,
            'To': `+91${phone}`,
            'Body': msg
        };

        // Stringify the payload
        const stringPayload = queryString.stringify(payload);

        // Configure the request details
        const requestDetails = {
            'protocol': 'https:',
            'hostname': 'api.twilio.com',
            'method': 'POST',
            'path': `/2010-04-01/Accounts/${config.twilio.accountSid}/Messages.json`,
            'auth': `${config.twilio.accountSid}:${config.twilio.authToken}`,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload)
            }
        };

        // Instantiate the request object
        const req = https.request(requestDetails, res => {
            // Grab the status of the sent request
            const status = res.statusCode;

            // Callback if the request successfully went through
            if (status == 200 || status == 201) {
                done(false);
            } else {
                done(`Status code returned was ${status}`);
            }
        });

        // Bind to the error event so it doesn't get thrown
        req.on('error', err => {
            done(err);
        });

        // Add the payload
        req.write(stringPayload);

        // End the request
        req.end();
    } else {
        done('Given parameters were missing or invalid');
    }
};

// Get the string content of a template
helpers.getTemplate = (templateName, data, done) => {

    // Sanity check the input
    templateName = typeof (templateName) == 'string' && templateName.length > 0 ? templateName : false;
    data = typeof (data) == 'object' && data !== null ? data : {};

    if (templateName) {

        const templateDir = path.join(__dirname, '/../templates/');
        fs.readFile(`${templateDir}${templateName}.html`, 'utf8', (err, str) => {

            if (!err && str.length > 0) {

                // Do interpolation on the string
                const finalString = helpers.interpolate(str, data);
                done(false, finalString);
            } else {
                done('No template could be found');
            }
        });
    } else {
        done('A valid template name is not specified');
    }
}

// Add the universal header and footer to a string, and pass the provided data object to the header and footer for interpolation
helpers.addUniversalTemplates = (str, data, done) => {

    // Sanity check the input
    templateName = typeof (templateName) == 'string' && templateName.length > 0 ? templateName : false;
    data = typeof (data) == 'object' && data !== null ? data : {};

    // Get the Header
    helpers.getTemplate('_header', data, (err, headerString) => {

        if(!err && headerString) {

            // Get the Footer
            helpers.getTemplate('_footer', data, (err, footerString) => {

                if(!err && footerString) {

                    // Add them all together
                    const fullString = headerString + str + footerString;
                    done(false, fullString);
                } else {
                    done('Could not find the footer template');
                }
            });
        } else {
            done('Could not find the header template');
        }
    });
}

// Take a given string and a data object and find/replace all the keys within it
helpers.interpolate = (str, data) => {

    // Sanity check
    str = typeof (str) == 'string' && str.length > 0 ? str : '';
    data = typeof (data) == 'object' && data !== null ? data : {};

    // Add the templateGlobals to the data object, prepending their key name with "global"
    for (const key in config.templateGlobals) {
        if (config.templateGlobals.hasOwnProperty(key)) {
            data[`global.${key}`] = config.templateGlobals[key];
        }
    }

    // For each key in the data object, insert it's value into the string at the coresponding placeholder
    for (const key in data) {
        if (data.hasOwnProperty(key) && typeof data[key] == 'string') {
            const replace = data[key];
            const find = '{' + key + '}';
            str = str.replace(find, replace);
        }
    }

    return str;
}

// Get the contents of a static (public) asset
helpers.getStaticAsset = (fileName, done) => {

    // Santiy check
    fileName = typeof (fileName) == 'string' && fileName.length > 0 ? fileName : false;

    if(fileName) {

        const publicDir = path.join(__dirname, '/../public/');
        fs.readFile(`${publicDir}${fileName}`, (err, data) => {

            if(!err && data) {

                done(false, data);
            } else {
                done('No file could be found');
            }
        });
    } else {
        done('A valid file name was not specified');
    }
}


// Export the module
module.exports = helpers;

