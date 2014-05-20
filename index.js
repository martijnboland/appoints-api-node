var config = require('./config');
var mongoose = require('mongoose');
var server = require('./server');

mongoose.connect(config.settings.db.connectionString);
server.start();