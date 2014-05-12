var middleware = require('./routehandlers/middleware');
var index = require('./routehandlers/index');
var auth = require('./routehandlers/auth');
var me = require('./routehandlers/me');
var passport = require('passport');

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
    auth.loggedin
  );

  router.post('/auth/facebook', auth.facebooktoken);
  
  router.get('/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );
  
  router.get('/auth/google/callback', 
    passport.authenticate('google', { scope: ['profile', 'email'] }),
    auth.loggedin
  );

  router.post('/auth/google', auth.googletoken);
}

