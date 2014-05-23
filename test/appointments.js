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

var user = null;
var token = null;

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
        dateAndTime: new Date("June 13, 2014 16:00:00"),
        duration: 30
      }, {
        title: 'Testappointment 2',
        user: { 
          id: user.id,
          displayName: user.displayName
        },
        dateAndTime: new Date("July 11, 2014 11:45:00"),
        duration: 30
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
      dateAndTime: '2014-06-13T16:00:00.000Z',
      duration: 60,
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
        dateAndTime: new Date("June 13, 2014 16:00:00"),
        duration: 30
      };

      Appointment.create(appointment, function(err, dbAppointment) {
        if (err) {
          throw err;
        }
        existingAppointment = {
          id: dbAppointment.id,
          title: dbAppointment.title,
          dateAndTime: dbAppointment.dateAndTime,
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
      existingAppointment.dateAndTime = '2014-07-28T16:15:00.000Z'; // ISO date because this is the value we're going to PUT
      request(app)
        .put('/appointments/' + existingAppointment.id)
        .set('authorization', 'Bearer ' + token)
        .send(existingAppointment)
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.title.should.equal('Testappointment 1');
          res.body.dateAndTime.should.equal('2014-07-28T16:15:00.000Z');
          done();
        });
    });

  });

  describe('PATCH /appointments/:id', function () {
    var existingAppointmentId = null;
    var newAppointmentDate = '2014-08-09T13:45:00.000Z';

    beforeEach(function (done) {
      // Create one appointment in the database that is to be updated. 
      var appointment = {
        title: 'Testappointment 1',
        user: { 
          id: user.id,
          displayName: user.displayName
        },
        dateAndTime: new Date("June 13, 2014 16:00:00"),
        duration: 30
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
        .send({ dateAndTime: newAppointmentDate })
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
        .send({ dateAndTime: newAppointmentDate })
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
        .set('authorization', 'Bearer ' + token)
        .send({ dateAndTime: newAppointmentDate })
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.title.should.equal('Testappointment 1');
          res.body.dateAndTime.should.equal('2014-08-09T13:45:00.000Z');
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
        dateAndTime: new Date("June 13, 2014 16:00:00"),
        duration: 30
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