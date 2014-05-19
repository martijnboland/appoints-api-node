var express = require('express');
var bodyParser = require('body-parser');
var leisure = require('leisure');
var passport = require('passport');
var passportConfig = require('./passport-config');

var mediaTypes = [
  { contentType: 'application/json' },
  { contentType: 'application/hal+json' }
];

passportConfig.configure();

var app = express();
app.use(bodyParser());
app.use(leisure.accept(mediaTypes));
app.use(passport.initialize());

var apiRouter = express.Router();
require('./routes')(apiRouter);
app.use('/', apiRouter);

function start () {
  var port = process.env.PORT || 3000;
  app.listen(port);
  console.log('Appoints service started on port ' + port);
}

exports.app = app;
exports.start = start;