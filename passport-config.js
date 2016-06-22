var config = require('./config');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('./models/user');

function handleProviderResponse(provider, userId, email, displayName, accessToken, refreshToken, callback) {
  User.findByUserIdAndProvider(userId, provider, function (err, dbUser) {
    if (! dbUser) {
      dbUser = new User({
        provider: provider,
        userId: userId,
        email: email, 
        displayName: displayName || email
      });
    }

    dbUser.providerAccessToken = accessToken;
    dbUser.providerRefreshToken = refreshToken;
    dbUser.lastAuthenticated = new Date();

    dbUser.save(function (err, dbUser) {
      if (err) {
        throw err;
      }
      callback(null, dbUser);
    });
  });
}

exports.configure = function () {

  passport.use(new FacebookStrategy({
      clientID: config.settings.authProviders.facebook.clientId,
      clientSecret: config.settings.authProviders.facebook.clientSecret,
      callbackURL: config.settings.authProviders.facebook.callbackUrl
    },
    function(accessToken, refreshToken, profile, done) {
      return handleProviderResponse('facebook', profile.id, profile.email, profile.displayName, accessToken, refreshToken, done);
    }
  ));

  passport.use(new GoogleStrategy({
      clientID: config.settings.authProviders.google.clientId,
      clientSecret: config.settings.authProviders.google.clientSecret,
      callbackURL: config.settings.authProviders.google.callbackUrl
    },
    function(accessToken, refreshToken, profile, done) {
      return handleProviderResponse('google', profile.id, profile.emails[0].value, profile.displayName, accessToken, refreshToken, done);
    }
  ));

  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (obj, done) {
    done(null, obj);
  });

}