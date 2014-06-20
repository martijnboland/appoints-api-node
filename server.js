var express = require('express');
var bodyParser = require('body-parser');
var leisure = require('leisure');
var cors = require('cors');
var passport = require('passport');
var config = require('./config');
var passportConfig = require('./passport-config');

var mediaTypes = [
  { contentType: 'application/hal+json' },
  { contentType: 'application/json' },
  { contentType: 'text/html' }
];

passportConfig.configure();

var app = express();
app.use(cors(config.settings.cors));
app.use(bodyParser());
app.use(leisure.accept(mediaTypes));
app.use(passport.initialize());

var routes = require('./routes');
app.use('/', routes.router);

function start () {
  var port = process.env.PORT || 3000;
  app.listen(port);
  console.log('Appoints service started on port ' + port);
}

exports.app = app;
exports.start = start;