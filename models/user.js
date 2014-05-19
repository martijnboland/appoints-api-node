
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var roles = {
  admin: 'admin',
  customer: 'customer'
};

var UserSchema = new Schema({
  userId: { type: String, required: true, index: { unique: true } },
  email: { type: String, required: true },
  name: { type: String, required: true },
  provider: { type: String, required: true },
  providerAccessToken: String,
  providerRefreshToken: String,
  created: { type: Date, default: Date.now },
  lastAuthenticated: { type: Date },
  roles: { type: [String], default: [roles.customer] }
});

UserSchema.static('allRoles', function () {
  return roles;
});

module.exports = mongoose.model('User', UserSchema);