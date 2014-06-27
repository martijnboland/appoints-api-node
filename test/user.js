/* global describe, beforeEach, afterEach, it*/
var User = require('../models/user');
var mongoose = require('mongoose');
var config = require('../config');
var should = require('should');

var testUserData = {
  userId: 'test user id',
  email: 'test@test.com',
  displayName: 'Test user',
  provider: 'Test'
};

describe('User persistence tests (env: ' + process.env.NODE_ENV + ')', function() {
  beforeEach(function (done) {
    mongoose.connect(config.settings.db.connectionString);
    User.remove({}, function(err) {
      done();
    });
  });

  describe('Create user', function () {
    it('should be possible to create a user in the test database', function (done) {
      var dbUser = new User(testUserData);
      dbUser.save(function(err, savedUser) {
        should.not.exist(err);
        should.exist(savedUser);
        savedUser.isNew.should.be.false;
        savedUser.should.have.property('id');
        savedUser.should.have.property('email', 'test@test.com')
        done();
      });
    });

    it('has a default role "customer"', function (done) {
      var dbUser = new User(testUserData);
      dbUser.save(function(err, savedUser) {
        should.not.exist(err);
        savedUser.isInRole('customer').should.be.true;
        savedUser.isInRole('non-exiting-role').should.be.false;
        done();
      });
    });
  });

  describe('Find user', function () {
    var userId;

    beforeEach(function (done) {
      var dbUser = new User(testUserData);
      dbUser.save(function(err, savedUser) {
        userId = savedUser.id;
        done();
      });
    });

    it('can find a user by provider userId and provider', function (done) {
      User.findByUserIdAndProvider('test user id', 'Test', function (err, dbUser) {
        should.not.exist(err);
        dbUser.userId.should.equal('test user id');
        done();
      });
    });   

    it('can find a user by internal id', function (done) {
      User.findById(userId, function (err, dbUser) {
        should.not.exist(err);
        dbUser.id.should.equal(userId);
        dbUser.userId.should.equal('test user id');
        done();
      });
    });

  });

  describe('Update user', function () {
    beforeEach(function (done) {
      var dbUser = new User(testUserData);
      dbUser.save(function(err, savedUser) {
        done();
      });
    });

    it('can find a user by userId and provider and update the tokens', function (done) {
      User.findByUserIdAndProvider('test user id', 'Test', function (err, dbUser) {
        should.not.exist(err);
        dbUser.providerAccessToken = '1234567890';
        dbUser.providerRefreshToken = '0987654321';
        var userId = dbUser.id;
        dbUser.save(function (err, dbUser) {
          should.not.exist(err);
          User.findById(userId, function (err, updatedUser) {
            should.not.exist(err);
            updatedUser.providerAccessToken.should.equal('1234567890');
            updatedUser.providerRefreshToken.should.equal('0987654321');
            done();
          })
        });
      });
    });   
  });  

  afterEach(function (done) {
    mongoose.disconnect();
    done();
  });
});