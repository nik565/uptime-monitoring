/**
 * Create and export configuration variables
 */

 // Container for all environments
 const environments = {};

 // Staging {default} environment
 environments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'staging',
    'hashingSecret': 'IronMan',
    'maxChecks': 5,
    'twilio': {
       'accountSid': 'AC33eb4d32a0b70d8d2304a701de2bee7f',
       'authToken': '19fbe8f01322072a32fa50951f0e97d1',
       'fromPhone': '+12138954788'
    },
    'templateGlobals': {
       'appName': 'UptimeChecker',
       'companyName': 'MonitorBuzz, Inc',
       'yearCreated': '2020',
       'baseUrl': 'http://localhost:3000/'
    }
 };

 // Testing {default} environment
 environments.testing = {
   'httpPort': 5000,
   'httpsPort': 5001,
   'envName': 'testing',
   'hashingSecret': 'IronMan',
   'maxChecks': 5,
   'twilio': {
      'accountSid': 'twilio_account_sid',
      'authToken': 'twilio_authToken',
      'fromPhone': 'twilio_phone_number'
   },
   'templateGlobals': {
      'appName': 'UptimeChecker',
      'companyName': 'MonitorBuzz, Inc',
      'yearCreated': '2020',
      'baseUrl': 'http://localhost:3000/'
   }
};

 // Production environment
 environments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'production',
    'hashingSecret': 'CaptainAmerica',
    'maxChecks': 5,
    'twilio': {
      'accountSid': '',
      'authToken': '',
      'fromPhone': ''
   },
   'templateGlobals': {
      'appName': 'UptimeChecker',
      'companyName': 'MonitorBuzz, Inc',
      'yearCreated': '2020',
      'baseUrl': 'http://localhost:5000/'
   }
 };

 // Determine which environment was passed as command-line argument
 const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

 // Check that currnent environment is one of the environment above, if not, default to staging
const environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;