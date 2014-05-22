var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var roles = {
  admin: 'admin',
  customer: 'customer'
};

var UserSchema = new Schema({
  userId: { type: String, required: true },
  email: { type: String, required: true },
  displayName: { type: String, required: true },
  provider: { type: String, required: true },
  providerAccessToken: String,
  providerRefreshToken: String,
  created: { type: Date, default: Date.now },
  lastAuthenticated: { type: Date },
  roles: { type: [String], default: [roles.customer] }
});

UserSchema.index({ userId: 1, provider: 1 }, { unique: true });

UserSchema.methods.isInRole = function (role) {
  for (var i = 0; i < this.roles.length; i++) {
    if (this.roles[i] === role) {
      return true;
    }
  }
  return false;
};

UserSchema.statics.allRoles = function () {
  return roles;
};

UserSchema.statics.findByUserIdAndProvider = function (userId, provider, callback) {
  this.findOne({ userId: userId, provider: provider }, callback);
};

module.exports = mongoose.model('User', UserSchema);