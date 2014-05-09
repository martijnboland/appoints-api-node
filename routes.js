var middleware = require('./routes/middleware');
var index = require('./routes/index');
var me = require('./routes/me');
var passport = require('passport');
var config = require('./config');

module.exports = function(router) {

  // Index
  router.get('/', index.index);
  
  // Me
  router.get('/me', middleware.ensureAuthenticated, me)

    // Authentication provider routes
  router.get('/auth/facebook', 
    passport.authenticate('facebook', { scope: 'email' })
  );
  
  router.get('/auth/facebook/callback', 
    passport.authenticate('facebook', { scope: 'email' }),
    index.loggedin
  );
  
  router.get('/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );
  
  router.get('/auth/google/callback', 
    passport.authenticate('google', { scope: ['profile', 'email'] }),
    index.loggedin
  );


}

