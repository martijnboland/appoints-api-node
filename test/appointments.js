/* global describe, it, before, beforeEach, after, afterEach */
var should = require('should');
var request = require('supertest');
var app = require('../server').app;
var mongoose = require('mongoose');
var User = require('../models/user');
var Appointment = require('../models/appointment');
var config = require('../config');
var security = require('../infrastructure/security');

var testUserData = {
  userId: '1234567890',
  email: 'massagecustomer@test.com',
  displayName: 'Jane Doe',
  provider: 'Test'
};

var testAppointment = {
  title: 'Regular full massage',
  dateAndTime: new Date("June 13, 2014 16:00:00"),
  duration: 60,
  remarks: 'Same oil as last time?'
}

var token = null;

describe('Appointment tests', function () {

  before(function (done) {
    mongoose.connect(config.settings.db.connectionString);
    User.remove({}, function (err) {
      User.create(testUserData, function (err, dbUser) {
        if (err) {
          throw err;
        }
        token = security.createTokenForUser(dbUser, 10);
        done();
      });
    });
  });

  beforeEach(function (done) {
    Appointment.remove({}, function (err) {
      if (err) {
        throw err;
      }
      done();
    });
  });

  describe('POST /appointments', function () {

    it('returns a 401 when not authenticated', function (done) {
      request(app)
        .post('/appointments')
        .send(testAppointment)
        .expect(401)
        .end(function (err, res) {
          should.not.exist(err);
          done();
        });
    });

    it('returns a 201 with location header set when a proper appointment is sent', function (done) {
      request(app)
        .post('/appointments')
        .set('authorization', 'Bearer ' + token)
        .send(testAppointment)
        .expect(201)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.title.should.equal('Regular full massage');
          res.header.location.should.startWith('/appointments');
          done();
        });
    });

    it('returns a 422 when an invalid appointment is sent', function (done) {
      request(app)
        .post('/appointments')
        .set('authorization', 'Bearer ' + token)
        .send({ title: 'Invalid appointment without some required properties.' } )
        .expect(422)
        .end(function (err, res) {
          should.not.exist(err);
          done();
        });
    });

  });

  after(function (done) {
    mongoose.disconnect();
    done();
  });

});