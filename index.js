var config = require('./config');
var mongoose = require('mongoose');
var server = require('./server');

mongoose.Promise = global.Promise;
mongoose.connect(config.settings.db.connectionString);

server.start();