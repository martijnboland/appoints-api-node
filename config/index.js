// Configuration is loaded based on the NODE_ENV environment variable.
// When no variable is set, the configuration is read from ./development.js.
module.exports = require('./' + (process.env.NODE_ENV || 'development'));