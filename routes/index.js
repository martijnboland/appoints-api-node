var jwt = require('jsonwebtoken');
var config = require('../config');

exports.index = function(req, res){
  res.send({
    message: 'Appoints service API',
    details: 'This is a REST api where you can schedule appointments for <insert business here>',
    _links: [{
      self: { href: '/'}
    }, {
      me: { href: '/me' }
    }, {
      appointments: { href: '/appointments' }
    }]
  })
};

exports.loggedin = function(req, res) {
  var token = jwt.sign(req.user, config.tokenSecret, { expiresInMinutes: 60*5 });
  res.send({
    message: 'Authentication successfull',
    token: token,
    _links: [{ self: { href: '/'} }, { me: { href: '/me' } }, { appointments: { href: '/appointments' } }]
  });
}