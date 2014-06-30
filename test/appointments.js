/*jshint expr: true*/
/* global describe, it, before, beforeEach, after, afterEach */
var should = require('should');
var request = require('supertest');
var app = require('../server').app;
var mongoose = require('mongoose');
var User = require('../models/user');
var Appointment = require('../models/appointment');
var config = require('../config');
var security = require('../infrastructure/security');
var moment = require('moment');

var testUserData = {
  userId: '1234567890',
  email: 'massagecustomer@test.com',
  displayName: 'Jane Doe',
  provider: 'Test'
};

var user = null;
var token = null;
var dateBaseline = moment().startOf('day'); // Date baseline for tests = today, 0:00

describe('Appointment tests', function () {

  before(function (done) {
    mongoose.connect(config.settings.db.connectionString);
    User.remove({}, function (err) {
      User.create(testUserData, function (err, dbUser) {
        if (err) {
          throw err;
        }
        user = dbUser;
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

  describe('GET /appointments', function () {
    
    beforeEach(function (done) {      
      var appointments = [{
        title: 'Testappointment 1',
        user: { 
          id: user.id,
          displayName: user.displayName
        },
        dateAndTime: dateBaseline.clone().add('days', 1).add('hours', 16).toDate(),
        endDateAndTime: dateBaseline.clone().add('days', 1).add('hours', 16).add('minutes', 30).toDate()
      }, {
        title: 'Testappointment 2',
        user: { 
          id: user.id,
          displayName: user.displayName
        },
        dateAndTime: dateBaseline.clone().add('days', 3).add('hours', 9).toDate(),
        endDateAndTime: dateBaseline.clone().add('days', 3).add('hours', 9).add('minutes', 45).toDate()
      }];

      Appointment.create(appointments, function(err) {
        if (err) {
          throw err;
        }
        done();
      })
    });

    it('returns a 401 when not authenticated', function (done) {
      request(app)
        .get('/appointments')
        .expect(401)
        .end(function (err, res) {
          should.not.exist(err);
          done();
        });
    });

    it('returns a 200 with an list of appointments ordered by date and time in descending order.', function (done) {
      request(app)
        .get('/appointments')
        .set('Accept', 'application/json')
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.should.have.property('count', 2);
          res.body._embedded.appointments.should.have.a.lengthOf(2);
          res.body._embedded.appointments[0].title.should.equal('Testappointment 2');
          done();
        });
    });

  });

  describe('POST /appointments', function () {

    var testAppointment = {
      title: 'Regular full massage',
      dateAndTime: dateBaseline.clone().add('days', 1).add('hours', 16).toISOString(),
      endDateAndTime: dateBaseline.clone().add('days', 1).add('hours', 17).toISOString(),
      remarks: 'I\'d like the same oil as last time.'
    }

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
        .set('Accept', 'application/json')
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

    it('returns a 422 when an appointment with past date is sent', function (done) {
      testAppointment.dateAndTime = dateBaseline.clone().add('days', -1).toISOString();
      request(app)
        .post('/appointments')
        .set('Accept', 'application/json')
        .set('authorization', 'Bearer ' + token)
        .send(testAppointment)
        .expect(422)
        .end(function (err, res) {
          should.not.exist(err);
          done();
        });
    });

  });

  describe('PUT /appointments/:id', function () {
    var existingAppointment = null;

    beforeEach(function (done) {
      // Create one appointment in the database that is to be updated. 
      var appointment = {
        title: 'Testappointment 1',
        user: { 
          id: user.id,
          displayName: user.displayName
        },
        dateAndTime: dateBaseline.clone().add('hours', 16).toDate(),
        endDateAndTime: dateBaseline.clone().add('hours', 16).add('minutes', 30).toDate()
      }

      Appointment.create(appointment, function(err, dbAppointment) {
        if (err) {
          throw err;
        }
        existingAppointment = {
          id: dbAppointment.id,
          title: dbAppointment.title,
          dateAndTime: dbAppointment.dateAndTime,
          endDateAndTime: dbAppointment.endDateAndTime,
          duration: dbAppointment.duration,
          remarks: dbAppointment.remarks
        }
        done();
      })
    });

    it('returns a 401 response when not authenticated', function (done) {
      request(app)
        .put('/appointments/' + existingAppointment.id)
        .send(existingAppointment)
        .expect(401)
        .end(function (err, res) {
          should.not.exist(err);
          done();
        });
    });

    it('returns a 404 response when the appointment is not found', function (done) {
      request(app)
        .put('/appointments/537e0a6795e2ee32ab736b1a') // bogus identifier
        .set('authorization', 'Bearer ' + token)
        .send(existingAppointment)
        .expect(404)
        .end(function (err, res) {
          should.not.exist(err);
          done();
        });
    });

    it('returns a 422 response when updating with invalid data', function (done) {
      existingAppointment.dateAndTime = ''; // required field
      request(app)
        .put('/appointments/' + existingAppointment.id)
        .set('authorization', 'Bearer ' + token)
        .send(existingAppointment)
        .expect(422)
        .end(function (err, res) {
          should.not.exist(err);
          done();
        });
    });

    it('returns a 200 response with the updated appointment', function (done) {
      var newDateAndTime = dateBaseline.clone().add('days', 1).add('hours', 15).add('minutes', 15).toISOString(); // ISO date because this is the value we're going to PUT
      existingAppointment.dateAndTime =  newDateAndTime 
      request(app)
        .put('/appointments/' + existingAppointment.id)
        .set('Accept', 'application/json')
        .set('authorization', 'Bearer ' + token)
        .send(existingAppointment)
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.title.should.equal('Testappointment 1');
          res.body.dateAndTime.should.equal(newDateAndTime);
          done();
        });
    });

  });

  describe('PATCH /appointments/:id', function () {
    var existingAppointmentId = null;
    var newAppointmentDate = dateBaseline.clone().add('days', 1).add('hours', 13).add('minutes', 45).toISOString();
    var newAppointmentEndDate = dateBaseline.clone().add('days', 1).add('hours', 14).add('minutes', 15).toISOString();

    beforeEach(function (done) {
      // Create one appointment in the database that is to be updated. 
      var appointment = {
        title: 'Testappointment 1',
        user: { 
          id: user.id,
          displayName: user.displayName
        },
        dateAndTime: dateBaseline.clone().add('hours', 15).add('minutes', 15).toDate(),
        endDateAndTime: dateBaseline.clone().add('hours', 15).add('minutes', 45).toDate()
      };

      Appointment.create(appointment, function(err, dbAppointment) {
        if (err) {
          throw err;
        }
        existingAppointmentId = dbAppointment.id;
        done();
      })
    });

    it('returns a 401 response when not authenticated', function (done) {
      request(app)
        .patch('/appointments/' + existingAppointmentId)
        .send({ dateAndTime: newAppointmentDate }, { endDateAndTime: newAppointmentEndDate })
        .expect(401)
        .end(function (err, res) {
          should.not.exist(err);
          done();
        });
    });

    it('returns a 404 response when the appointment is not found', function (done) {
      request(app)
        .patch('/appointments/537e0a6795e2ee32ab736b1a') // bogus identifier
        .set('authorization', 'Bearer ' + token)
        .send({ dateAndTime: newAppointmentDate }, { endDateAndTime: newAppointmentEndDate })
        .expect(404)
        .end(function (err, res) {
          should.not.exist(err);
          done();
        });
    });

    it('returns a 422 response when updating with invalid data', function (done) {
      request(app)
        .patch('/appointments/' + existingAppointmentId)
        .set('authorization', 'Bearer ' + token)
        .send({ dateAndTime: '' })
        .expect(422)
        .end(function (err, res) {
          should.not.exist(err);
          done();
        });
    });

    it('returns a 200 response with the updated appointment', function (done) {
      request(app)
        .patch('/appointments/' + existingAppointmentId)
        .set('Accept', 'application/json')
        .set('authorization', 'Bearer ' + token)
        .send({ dateAndTime: newAppointmentDate, endDateAndTime: newAppointmentEndDate })
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.title.should.equal('Testappointment 1');
          res.body.dateAndTime.should.equal(newAppointmentDate);
          res.body.endDateAndTime.should.equal(newAppointmentEndDate);
          res.body.duration.should.equal(30);
          done();
        });
    });

    it('returns a 200 response with the updated and sanitized appointment', function (done) {
      request(app)
        .patch('/appointments/' + existingAppointmentId)
        .set('Accept', 'application/json')
        .set('authorization', 'Bearer ' + token)
        .send({ remarks: '<script>alert("p0wned");</script> content that should not be cleaned' })
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.title.should.equal('Testappointment 1');
          res.body.remarks.should.equal(' content that should not be cleaned');
          done();
        });
    });

  });

  describe('DELETE /appointments/:id', function () {
    var existingAppointmentId = null;

    beforeEach(function (done) {
      // Create one appointment in the database that is to be updated. 
      var appointment = {
        title: 'Testappointment 1',
        user: { 
          id: user.id,
          displayName: user.displayName
        },
        dateAndTime: dateBaseline.clone().add('hours', 15).add('minutes', 15).toDate(),
        endDateAndTime: dateBaseline.clone().add('hours', 15).add('minutes', 45).toDate()
      };

      Appointment.create(appointment, function(err, dbAppointment) {
        if (err) {
          throw err;
        }
        existingAppointmentId = dbAppointment.id;
        done();
      })
    });

    it('returns a 401 response when not authenticated', function (done) {
      request(app)
        .delete('/appointments/' + existingAppointmentId)
        .expect(401)
        .end(function (err, res) {
          should.not.exist(err);
          done();
        });
    });

    it('returns a 404 response when the appointment is not found', function (done) {
      request(app)
        .delete('/appointments/537e0a6795e2ee32ab736b1a') // bogus identifier
        .set('authorization', 'Bearer ' + token)
        .expect(404)
        .end(function (err, res) {
          should.not.exist(err);
          done();
        });
    });

    it('returns a 200 response with a confirmation message when successful', function (done) {
      request(app)
        .delete('/appointments/' + existingAppointmentId)
        .set('Accept', 'application/json')
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.should.have.property('message');
          // there should be no appointments in the database
          Appointment.find({}, function(err, appointments) {
            should.not.exist(err);
            appointments.should.be.empty;
            done();
          });
        });
    });

  });

  after(function (done) {
    mongoose.disconnect();
    done();
  });

});