var config = require('./config');
var mongoose = require('mongoose');

mongoose.connect(config.settings.db.connectionString);
var server = require('./server');
server.start();