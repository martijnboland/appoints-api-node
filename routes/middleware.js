var jwt = require('jsonwebtoken');
var config = require('../config');

exports.ensureAuthenticated =  function (req, res, next) {
  var token;
    
  if (req.method === 'OPTIONS' && req.headers.hasOwnProperty('access-control-request-headers')) {
    for (var ctrlReqs = req.headers['access-control-request-headers'].split(','),i=0; i < ctrlReqs.length; i++) {
      if (ctrlReqs[i].indexOf('authorization') != -1) 
        return next();
    }
  }
        
  if (req.headers && req.headers.authorization) {
    var parts = req.headers.authorization.split(' ');
    if (parts.length == 2) {
      var scheme = parts[0]
        , credentials = parts[1];
        
      if (/^Bearer$/i.test(scheme)) {
        token = credentials;
      }
    } 
    else {
      notAuthenticated('Invalid header. Format is Authorization: Bearer [token]');
    }
  } 
  else {
    notAuthenticated('No Authorization header was found');
  }

  jwt.verify(token, config.tokenSecret, null, function(err, decoded) {
    if (err) {
      notAuthenticated('Invalid or expired token.');
    }
    req.user = decoded;
    next();
  });

  function notAuthenticated(details) {
    res.send('401', { 
      message: 'Access to ' + req.path + ' is not allowed.',
      details: details,
      links: [{
        auth_facebook: { href: '/auth/facebook' }
      }, {
        auth_google: { href: '/auth/google' }
      }]
    });

  }
};


