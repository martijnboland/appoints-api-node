// This is an example configuration file. Rename this file to development.js
// and set the values to get going.
var settings = {
  db: {
    connectionString: 'mongodb://localhost/appoints'
  }, 
  authProviders: {
    facebook: { 
      clientId: 'your client id here', 
      clientSecret: 'your client secret here', 
      callbackUrl: 'http://localhost:3000/auth/facebook/callback' 
    },
    google: { 
      clientId: 'your client id here', 
      clientSecret: 'your client secret here', 
      callbackUrl: 'http://localhost:3000/auth/google/callback' 
    }
  },
  tokenSecret: 'my super duper shared secret'
};

exports.settings = settings;