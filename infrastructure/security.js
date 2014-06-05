var jwt = require('jsonwebtoken');
var config = require('../config');

exports.createTokenForUser = function (user, expiresInMinutes) {
  var payload = {
    sub: user.id,
    roles: user.roles
  };
  var token = jwt.sign(payload, config.settings.tokenSecret, { expiresInMinutes: expiresInMinutes });
  return token;
}