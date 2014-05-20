var User = require('../models/user');
var mongoose = require('mongoose');
var config = require('../config');
var should = require('should');

describe('User persistence tests (env: ' + process.env.NODE_ENV + ')', function() {
  beforeEach(function (done) {
    mongoose.connect(config.settings.db.connectionString);
    User.remove({}, function(err) {
      done();
    });
  });

  describe('Create user', function () {
    it('Should be possible to create a user in the test database', function (done) {
      var userData = {
        userId: 'test user id',
        email: 'test@test.com',
        name: 'Test user',
        provider: 'Test'
      };
      var dbUser = new User(userData);
      dbUser.save(function(err, savedUser) {
        should.not.exist(err);
        should.exist(savedUser);
        savedUser.should.have.property('isNew', false);
        savedUser.should.have.property('id');
        savedUser.should.have.property('email', 'test@test.com')
        savedUser.should.have.property('created');
        done();
      });
    });
  });

  afterEach(function (done) {
    mongoose.disconnect();
    done();
  });
});