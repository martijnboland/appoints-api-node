var jwt = require('jsonwebtoken');
var config = require('../config');
var User = require('../models/user');
var sanitizer = require('sanitizer');

exports.ensureAuthenticated =  function (req, res, next) {

  function notAuthenticated (details) {
    res.status(401).send({ 
      message: 'Access to ' + req.path + ' is not allowed.',
      details: details,
      _links: {
        auth_facebook: { href: '/auth/facebook' }, 
        auth_google: { href: '/auth/google' }
      }
    });
  }

  var token;
    
  if (req.method === 'OPTIONS' && req.headers.hasOwnProperty('access-control-request-headers')) {
    for (var ctrlReqs = req.headers['access-control-request-headers'].split(','),i=0; i < ctrlReqs.length; i++) {
      if (ctrlReqs[i].indexOf('authorization') !== -1) {
        return next();
      }
    }
  }
        
  if (req.headers && req.headers.authorization) {
    var parts = req.headers.authorization.split(' ');
    if (parts.length === 2) {
      var scheme = parts[0], 
        credentials = parts[1];
        
      if (/^Bearer$/i.test(scheme)) {
        token = credentials;
      }
    } 
    else {
      return notAuthenticated('Invalid header. Format is Authorization: Bearer [token]');
    }
  } 
  else {
    return notAuthenticated('No Authorization header was found. Format is Authorization: Bearer [token]');
  }

  jwt.verify(token, config.settings.tokenSecret, null, function(err, decoded) {
    if (err) {
      notAuthenticated('Invalid or expired token');
    }
    else {
      User.findById(decoded.sub, function (err, dbUser) {
        if (err || (! dbUser)) {
          notAuthenticated('Valid token, but we could not find a corresponding user in our database.');
        }
        else {
          req.user = dbUser;
          next();
        }
      });
    }
  });
  
};

exports.sanitizeRequestBody = function (req, res, next) {
  if (req.body) {
    for (var prop in req.body) {
      if (typeof req.body[prop] === 'string') {
        req.body[prop] = sanitizer.sanitize(req.body[prop]);
      }
    }
  }
  next();
};