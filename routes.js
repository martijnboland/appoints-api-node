var express = require('express');
var passport = require('passport');

var middleware = require('./routehandlers/middleware');
var index = require('./routehandlers/index');
var auth = require('./routehandlers/auth');
var me = require('./routehandlers/me');
var appointments = require('./routehandlers/appointments');

var router = express.Router();

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

// Appointments
router.post('/appointments', middleware.ensureAuthenticated, appointments.create);

router.route('/appointments/:id')
  .all(middleware.ensureAuthenticated)
  .get(appointments.getById)
  .put(appointments.update)
  .delete(appointments.delete);

// My
router.get('/my/apppointments', middleware.ensureAuthenticated, appointments.getByUserId);

// --
module.exports.router = router;