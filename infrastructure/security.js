var jwt = require('jsonwebtoken');
var config = require('../config');

exports.createTokenForUser = function (user, expiresInMinutes) {
  var token = jwt.sign(user, config.settings.tokenSecret, { expiresInMinutes: expiresInMinutes });
  return token;
}