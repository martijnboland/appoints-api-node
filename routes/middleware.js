exports.ensureAuthenticated =  function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.send('401', { 
    message: 'Access to ' + req.path + ' is not allowed.',
    details: 'Access is not allowed. Make sure that the header contains an access token.',
    links: [{
      auth_facebook: { href: '/auth/facebook' }
    }, {
      auth_google: { href: '/auth/google' }
    }]
  });
};