var middleware = require('./routes/middleware');
var index = require('./routes/index');
var me = require('./routes/me');

module.exports = function(router) {

  // Index
  router.get('/', index.index);
  
  // Me
  router.get('/me', middleware.ensureAuthenticated, me)


}

