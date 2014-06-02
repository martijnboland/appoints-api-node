/* global describe, it */
var should = require('should'); 
var request = require('supertest');  
var app = require('../server').app;

describe('Basic route tests', function () {
  describe('GET /', function () {
   
    it('returns a json response with message, details and a links collection', function (done) {
      request(app)
        .get('/')
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.should.have.property('message');
          res.body.should.have.property('details');
          res.body.should.have.property('_links');
          done();
        });
    });

  });

  describe('GET /me (without authorization header)', function () {

    it('returns a 401 response with message, details and a links collection ', function (done) {
      request(app)
        .get('/me')
        .set('Accept', 'application/json')
        .expect(401)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.should.have.property('message');
          res.body.should.have.property('details');
          res.body.should.have.property('_links');
          done();
        })    
    });

  });
});
