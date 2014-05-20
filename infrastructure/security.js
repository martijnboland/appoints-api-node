var jwt = require('jsonwebtoken');
var config = require('../config');

exports.createTokenForUser = function (user, expiresInMinutes) {
  var payload = {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    roles: user.roles
  };
  var token = jwt.sign(payload, config.settings.tokenSecret, { expiresInMinutes: expiresInMinutes });
  return token;
}