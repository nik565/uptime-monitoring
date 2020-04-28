/**
 *  Frontend logic for the Appliaction
 */


// Container for the frontend Application
const app = {};

// Config
app.config = {
    'sessionToken': false
}

// AJAX client (for the RESTful API)
app.client = {};

// Interface for making API calls
app.client.request = (headers, path, method, queryStringObject, payload, done) => {

    // Set defaults
    headers = typeof (headers) == 'object' && headers !== null ? headers : {};
    path = typeof (path) == 'string' ? path : '/';
    method = typeof (method) == 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(method) > -1 ? method : 'GET';
    queryStringObject = typeof (queryStringObject) == 'object' && queryStringObject !== null ? queryStringObject : {};
    payload = typeof (payload) == 'object' && payload !== null ? payload : {};
    done = typeof (done) == 'function' ? done : false;

    // For each query string parameter sent, add it to the path
    let requestUrl = path + '?';
    let counter = 0;
    for (const queryKey in queryStringObject) {
        if (queryStringObject.hasOwnProperty(queryKey)) {
            counter++;
            // If at least one query string parameter has already been added, prepend new one with ampersand
            if (counter > 1) {
                requestUrl += '&';
            }

            // Add the key and value
            requestUrl += `${queryKey}=${queryStringObject[queryKey]}`;
        }
    }

    // Form the HTTP request as a JSON type
    const xhr = new XMLHttpRequest();
    xhr.open(method, requestUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    // For each header sent, add it to the request
    for (const headerKey in headers) {
        if (headers.hasOwnProperty(headerKey)) {
            xhr.setRequestHeader(headerKey, headers[headerKey]);
        }
    }

    // If there is a session token, add that as a header
    if (app.config.sessionToken) {
        xhr.setRequestHeader('token', app.config.sessionToken.id);
    }

    // When the request comes back, handle the response
    let statusCode, responseReturned;
    xhr.onreadystatechange = () => {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            statusCode = xhr.status;
            responseReturned = xhr.responseText;

            // Execute callback if required
            if (done) {
                try {
                    const parsedResponse = JSON.parse(responseReturned);
                    done(statusCode, parsedResponse);
                } catch (e) {
                    done(statusCode, false);
                }
            }
        }
    }

    // send the payload as JSON
    const payloadString = JSON.stringify(payload);
    xhr.send(payloadString);
}

// Bind the logout button
app.bindLogoutButton = () => {
    document.getElementById('logoutButton').addEventListener('click', (e) => {

        // Stop it from redirecting anywhere
        e.preventDefault();

        // Log the user out
        app.logUserOut();

    });
};

// Log the user out then redirect them
app.logUserOut = (redirectUser) => {
    // Set redirectUser to default to true
    redirectUser = typeof (redirectUser) == 'boolean' ? redirectUser : true;

    // Get the current token id
    const tokenId = typeof (app.config.sessionToken.id) == 'string' ? app.config.sessionToken.id : false;

    // Send the current token to the tokens endpoint to delete it
    const queryStringObject = {
        'id': tokenId
    };
    app.client.request(undefined, 'api/tokens', 'DELETE', queryStringObject, undefined, (statusCode, responsePayload) => {
        // Set the app.config token as false
        app.setSessionToken(false);

        // Send the user to the logged out page
        if (redirectUser) {
            window.location = '/session/deleted';
        }

    });
};


// Bind the forms
app.bindForms = () => {

    if (document.querySelector('form')) {
        const allForms = document.querySelectorAll('form');
        for (let index = 0; index < allForms.length; index++) {
            allForms[index].addEventListener('submit', function (e) {

                // Stop it from submitting
                e.preventDefault();
                const formId = this.id;
                const path = this.action;
                let method = this.method.toUpperCase();

                // Hide the error message (if it's currently shown due to a previous error)
                document.querySelector(`#${formId} .formError`).style.display = 'hidden';

                // Turn the inputs into a payload
                const payload = {};
                const elements = this.elements;
                for (let i = 0; i < elements.length; i++) {
                    if (elements[i].type !== 'submit') {
                        // Determine class of element and set value accordingly
                        const classOfElement = typeof (elements[i].classList.value) == 'string' && elements[i].classList.value.length > 0 ? elements[i].classList.value : '';
                        const valueOfElement = elements[i].type == 'checkbox' && classOfElement.indexOf('multiselect') == -1 ? elements[i].checked : classOfElement.indexOf('intval') == -1 ? elements[i].value : parseInt(elements[i].value);
                        const elementIsChecked = elements[i].checked;
                        // Override the method of the form if the input's name is _method
                        let nameOfElement = elements[i].name;
                        if (nameOfElement == '_method') {
                            method = valueOfElement;
                        } else {
                            // Create an payload field named "method" if the elements name is actually httpmethod
                            if (nameOfElement == 'httpmethod') {
                                nameOfElement = 'method';
                            }
                            // Create an payload field named "id" if the elements name is actually uid
                            if (nameOfElement == 'uid') {
                                nameOfElement = 'id';
                            }
                            // If the element has the class "multiselect" add its value(s) as array elements
                            if (classOfElement.indexOf('multiselect') > -1) {
                                if (elementIsChecked) {
                                    payload[nameOfElement] = typeof (payload[nameOfElement]) == 'object' && payload[nameOfElement] instanceof Array ? payload[nameOfElement] : [];
                                    payload[nameOfElement].push(valueOfElement);
                                }
                            } else {
                                payload[nameOfElement] = valueOfElement;
                            }

                        }
                    }
                }
                console.log('Payload: ', payload);

                // If the method is DELETE, the payload should be a queryStringObject instead
                const queryStringObject = method == 'DELETE' ? payload : {};

                // Call the API
                app.client.request(undefined, path, method, queryStringObject, payload, (statusCode, responsePayload) => {
                    // Display an error on the form if needed
                    if (statusCode !== 200) {

                        if (statusCode == 403) {

                            // log the user out
                            app.logUserOut();
                        } else {
                            // Try to get the error from the api, or set a default error message
                            const error = typeof (responsePayload.Error) == 'string' ? responsePayload.Error : 'An error has occured, please try again';

                            // Set the formError field with the error text
                            document.querySelector(`#${formId} .formError`).innerHTML = error;

                            // Show (unhide) the form error field on the form
                            document.querySelector(`#${formId} .formError`).style.display = 'block';
                        }
                    } else {
                        // If successful, send to form response processor
                        app.formResponseProcessor(formId, payload, responsePayload);
                    }

                });
            });

        }
    }
};

// Form response processor
app.formResponseProcessor = (formId, requestPayload, responsePayload) => {
    let functionToCall = false;
    // If account creation was successful, try to immediately log the user in
    if (formId == 'accountCreate') {
        // Take the phone and password, and use it to log the user in
        var newPayload = {
            'phone': requestPayload.phone,
            'password': requestPayload.password
        };

        app.client.request(undefined, 'api/tokens', 'POST', undefined, newPayload, (newStatusCode, newResponsePayload) => {
            // Display an error on the form if needed
            if (newStatusCode !== 200) {

                // Set the formError field with the error text
                document.querySelector(`#${formId} .formError`).innerHTML = 'Sorry, an error has occured. Please try again.';

                // Show (unhide) the form error field on the form
                document.querySelector(`#${formId} .formError`).style.display = 'block';

            } else {
                // If successful, set the token and redirect the user
                app.setSessionToken(newResponsePayload);
                window.location = '/checks/all';
            }
        });
    }
    // If login was successful, set the token in localstorage and redirect the user
    if (formId == 'sessionCreate') {
        app.setSessionToken(responsePayload);
        window.location = '/checks/all';
    }

    // If forms saved successfully and they have success messages, show them
    const formsWithSuccessMessages = ['accountEdit1', 'accountEdit2'];
    if (formsWithSuccessMessages.indexOf(formId) > -1) {
        document.querySelector(`#${formId} .formSuccess`).style.display = 'block';
    }

    // If the user just deleted their account, redirect them to the account-deleted page
    if (formId == 'accountEdit3') {
        app.logUserOut(false);
        window.location = '/account/deleted';
    }

    // If the user just created a new check successfully, redirect them back to the dashboard
    if (formId == 'checksCreate') {
        window.location = '/checks/all'
    }

    // If the user just deleted a check, redirect them to the dashboard
    if (formId == 'checksEdit2') {
        window.location = '/checks/all';
    }
};

// Get the session token from localstorage and set it in the app.config object
app.getSessionToken = () => {
    var tokenString = localStorage.getItem('token');
    if (typeof (tokenString) == 'string') {
        try {
            const token = JSON.parse(tokenString);
            app.config.sessionToken = token;
            if (typeof (token) == 'object') {
                app.setLoggedInClass(true);
            } else {
                app.setLoggedInClass(false);
            }
        } catch (e) {
            app.config.sessionToken = false;
            app.setLoggedInClass(false);
        }
    }
};

// Set (or remove) the loggedIn class from the body
app.setLoggedInClass = (add) => {
    const target = document.querySelector('body');
    if (add) {
        target.classList.add('loggedIn');
    } else {
        target.classList.remove('loggedIn');
    }
};

// Set the session token in the app.config object as well as localstorage
app.setSessionToken = (token) => {
    app.config.sessionToken = token;
    const tokenString = JSON.stringify(token);
    localStorage.setItem('token', tokenString);
    if (typeof (token) == 'object') {
        app.setLoggedInClass(true);
    } else {
        app.setLoggedInClass(false);
    }
};

// Renew the token
app.renewToken = (done) => {
    const currentToken = typeof (app.config.sessionToken) == 'object' ? app.config.sessionToken : false;
    if (currentToken) {
        // Update the token with a new expiration
        const payload = {
            'id': currentToken.id,
            'extend': true,
        };
        app.client.request(undefined, 'api/tokens', 'PUT', undefined, payload, (statusCode, responsePayload) => {
            // Display an error on the form if needed
            if (statusCode == 200) {
                // Get the new token details
                const queryStringObject = { 'id': currentToken.id };
                app.client.request(undefined, 'api/tokens', 'GET', queryStringObject, undefined, (statusCode, responsePayload) => {
                    // Display an error on the form if needed
                    if (statusCode == 200) {
                        app.setSessionToken(responsePayload);
                        done(false);
                    } else {
                        app.setSessionToken(false);
                        done(true);
                    }
                });
            } else {
                app.setSessionToken(false);
                done(true);
            }
        });
    } else {
        app.setSessionToken(false);
        done(true);
    }
};

// Load data on the page
app.loadDataOnPage = () => {
    // Get the current page from the body class
    const bodyClasses = document.querySelector('body').classList;
    const primaryClass = typeof (bodyClasses[0]) == 'string' ? bodyClasses[0] : false;

    // Logic for account settings page
    if (primaryClass == 'accountEdit') {
        app.loadAccountEditPage();
    }

    // Logic for dashboard page
    if (primaryClass == 'checksList') {
        app.loadChecksListPage();
    }

    // Logic for check details page
    if (primaryClass == 'checksEdit') {
        app.loadChecksEditPage();
    }
};

// Load the account edit page specifically
app.loadAccountEditPage = () => {
    // Get the phone number from the current token, or log the user out if none is there
    const phone = typeof (app.config.sessionToken.phone) == 'string' ? app.config.sessionToken.phone : false;
    if (phone) {
        // Fetch the user data
        const queryStringObject = {
            'phone': phone
        };
        app.client.request(undefined, 'api/users', 'GET', queryStringObject, undefined, (statusCode, responsePayload) => {
            if (statusCode == 200) {
                // Put the data into the forms as values where needed
                document.querySelector("#accountEdit1 .firstNameInput").value = responsePayload.firstName;
                document.querySelector("#accountEdit1 .lastNameInput").value = responsePayload.lastName;
                document.querySelector("#accountEdit1 .displayPhoneInput").value = responsePayload.phone;

                // Put the hidden phone field into both forms
                const hiddenPhoneInputs = document.querySelectorAll("input.hiddenPhoneNumberInput");
                for (let i = 0; i < hiddenPhoneInputs.length; i++) {
                    hiddenPhoneInputs[i].value = responsePayload.phone;
                }

            } else {
                // If the request comes back as something other than 200, log the user out (on the assumption that the api is temporarily down or the users token is bad)
                app.logUserOut();
            }
        });
    } else {
        app.logUserOut();
    }
};

// Load the dashboard page specifically
app.loadChecksListPage = () => {
    // Get the phone number from the current token, or log the user out if none is there
    const phone = typeof (app.config.sessionToken.phone) == 'string' ? app.config.sessionToken.phone : false;
    if (phone) {
        // Fetch the user data
        const queryStringObject = {
            'phone': phone
        };
        app.client.request(undefined, 'api/users', 'GET', queryStringObject, undefined, (statusCode, responsePayload) => {
            if (statusCode == 200) {

                // Determine how many checks the user has
                const allChecks = typeof (responsePayload.checks) == 'object' && responsePayload.checks instanceof Array && responsePayload.checks.length > 0 ? responsePayload.checks : [];
                if (allChecks.length > 0) {

                    // Show each created check as a new row in the table
                    allChecks.forEach((checkId) => {
                        // Get the data for the check
                        const newQueryStringObject = {
                            'id': checkId
                        };
                        app.client.request(undefined, 'api/checks', 'GET', newQueryStringObject, undefined, function (statusCode, responsePayload) {
                            if (statusCode == 200) {
                                const checkData = responsePayload;
                                // Make the check data into a table row
                                const table = document.getElementById("checksListTable");
                                const tr = table.insertRow(-1);
                                tr.classList.add('checkRow');
                                const td0 = tr.insertCell(0);
                                const td1 = tr.insertCell(1);
                                const td2 = tr.insertCell(2);
                                const td3 = tr.insertCell(3);
                                const td4 = tr.insertCell(4);
                                td0.innerHTML = responsePayload.method.toUpperCase();
                                td1.innerHTML = responsePayload.protocol + '://';
                                td2.innerHTML = responsePayload.url;
                                const state = typeof (responsePayload.state) == 'string' ? responsePayload.state : 'unknown';
                                td3.innerHTML = state;
                                td4.innerHTML = '<a href="/checks/edit?id=' + responsePayload.id + '">View / Edit / Delete</a>';
                            } else {
                                console.log("Error trying to load check ID: ", checkId);
                            }
                        });
                    });

                    if (allChecks.length < 5) {
                        // Show the createCheck CTA
                        document.getElementById("createCheckCTA").style.display = 'block';
                    }

                } else {
                    // Show 'you have no checks' message
                    document.getElementById("noChecksMessage").style.display = 'table-row';

                    // Show the createCheck CTA
                    document.getElementById("createCheckCTA").style.display = 'block';

                }
            } else {
                // If the request comes back as something other than 200, log the user out (on the assumption that the api is temporarily down or the users token is bad)
                app.logUserOut();
            }
        });
    } else {
        app.logUserOut();
    }
};

// Load the checks edit page specifically
app.loadChecksEditPage = () => {
    // Get the check id from the query string, if none is found then redirect back to dashboard
    const id = typeof (window.location.href.split('=')[1]) == 'string' && window.location.href.split('=')[1].length > 0 ? window.location.href.split('=')[1] : false;
    if (id) {
        // Fetch the check data
        const queryStringObject = {
            'id': id
        };
        app.client.request(undefined, 'api/checks', 'GET', queryStringObject, undefined, (statusCode, responsePayload) => {
            if (statusCode == 200) {

                // Put the hidden id field into both forms
                const hiddenIdInputs = document.querySelectorAll("input.hiddenIdInput");
                for (let i = 0; i < hiddenIdInputs.length; i++) {
                    hiddenIdInputs[i].value = responsePayload.id;
                }

                // Put the data into the top form as values where needed
                document.querySelector("#checksEdit1 .displayIdInput").value = responsePayload.id;
                document.querySelector("#checksEdit1 .displayStateInput").value = responsePayload.state;
                document.querySelector("#checksEdit1 .protocolInput").value = responsePayload.protocol;
                document.querySelector("#checksEdit1 .urlInput").value = responsePayload.url;
                document.querySelector("#checksEdit1 .methodInput").value = responsePayload.method;
                document.querySelector("#checksEdit1 .timeoutInput").value = responsePayload.timeoutSeconds;
                const successCodeCheckboxes = document.querySelectorAll("#checksEdit1 input.successCodesInput");
                for (let i = 0; i < successCodeCheckboxes.length; i++) {
                    if (responsePayload.successCodes.indexOf(parseInt(successCodeCheckboxes[i].value)) > -1) {
                        successCodeCheckboxes[i].checked = true;
                    }
                }
            } else {
                // If the request comes back as something other than 200, redirect back to dashboard
                window.location = '/checks/all';
            }
        });
    } else {
        window.location = '/checks/all';
    }
};

// Loop to renew token often
app.tokenRenewalLoop = () => {
    setInterval(() => {
        app.renewToken((err) => {
            if (!err) {
                console.log('Token renewed successfully @ ' + Date.now());
            }
        });
    }, 1000 * 60);
};

// Init (bootstrapping)
app.init = () => {
    // Bind all form submissions
    app.bindForms();

    // Bind logout logout button
    app.bindLogoutButton();

    // Get the token from localstorage
    app.getSessionToken();

    // Renew token
    app.tokenRenewalLoop();

    // Load data on page
    app.loadDataOnPage();
};

// Call the init processes after the window loads
window.onload = () => {
    app.init();
};