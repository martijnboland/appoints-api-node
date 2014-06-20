// This is an example test configuration file. 
//
// By default, the test database is named 'appointstest'.
//
// The clientId and clientSecret values are dummies. These can be
// set to anything for the tests.
//
var settings = {
  db: {
    connectionString: 'mongodb://localhost/appointstest'
  }, 
  authProviders: {
    facebook: { 
      clientId: 'test', 
      clientSecret: '1234567890', 
      callbackUrl: 'http://localhost:3000/auth/facebook/callback' 
    },
    google: { 
      clientId: 'test', 
      clientSecret: '1234567890', 
      callbackUrl: 'http://localhost:3000/auth/google/callback' 
    }
  },
  tokenSecret: 'test token secret',
  cors: {
    origin: "http://localhost:3001",
    methods: [ "GET", "POST", "PUT", "PATCH", "DELETE", "HEAD" ]
  }
};

exports.settings = settings;