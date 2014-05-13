var should = require('should'); 
var request = require('supertest');  
var app = require('../server').app;

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
        res.body._links.length.should.be.above(0);
        done();
      });
  });
});