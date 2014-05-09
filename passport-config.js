var config = require('./config');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

exports.configStrategies = function () {

  passport.use(new FacebookStrategy({
      clientID: config.settings.authProviders.facebook.clientId,
      clientSecret: config.settings.authProviders.facebook.clientSecret,
      callbackURL: config.settings.authProviders.facebook.callbackUrl
    },
    function(accessToken, refreshToken, profile, done) {
      return handleProviderResponse('facebook', profile.id, profile.emails[0].value, profile.displayName, done);
    }
  ));

  passport.use(new GoogleStrategy({
      clientID: config.settings.authProviders.google.consumerKey,
      clientSecret: config.settings.authProviders.google.consumerSecret,
      callbackURL: config.settings.authProviders.google.callbackUrl
    },
    function(accessToken, refreshToken, profile, done) {
      return handleProviderResponse('google', profile.id, profile.emails[0].value, profile.displayName, done);
    }
  ));

}

function handleProviderResponse(provider, userId, email, displayName, done) {
  var user = {
    provider: provider,
    userId: userId,
    email: email,
    displayName: displayName
  };
  done(null, user);
}
