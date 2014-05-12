var config = require('./config');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

exports.configure = function () {

  passport.use(new FacebookStrategy({
      clientID: config.settings.authProviders.facebook.clientId,
      clientSecret: config.settings.authProviders.facebook.clientSecret,
      callbackURL: config.settings.authProviders.facebook.callbackUrl
    },
    function(accessToken, refreshToken, profile, done) {
      return handleProviderResponse('facebook', accessToken, profile.id, profile.emails[0].value, profile.displayName, done);
    }
  ));

  passport.use(new GoogleStrategy({
      clientID: config.settings.authProviders.google.consumerKey,
      clientSecret: config.settings.authProviders.google.consumerSecret,
      callbackURL: config.settings.authProviders.google.callbackUrl
    },
    function(accessToken, refreshToken, profile, done) {
      return handleProviderResponse('google', accessToken, profile.id, profile.emails[0].value, profile.displayName, done);
    }
  ));

  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (obj, done) {
    done(null, obj);
  });

}

function handleProviderResponse(provider, accessToken, userId, email, displayName, done) {
  var user = {
    provider: provider,
    providerAccessToken: accessToken,
    userId: userId,
    email: email,
    displayName: displayName
  };
  done(null, user);
}
