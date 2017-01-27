'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newEmailsMining;

describe('EmailsMining API:', function() {
  describe('GET /api/emails-minings', function() {
    var emailsMinings;

    beforeEach(function(done) {
      request(app)
        .get('/api/emails-minings')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          emailsMinings = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      emailsMinings.should.be.instanceOf(Array);
    });
  });

  describe('POST /api/emails-minings', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/emails-minings')
        .send({
          name: 'New EmailsMining',
          info: 'This is the brand new emailsMining!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newEmailsMining = res.body;
          done();
        });
    });

    it('should respond with the newly created emailsMining', function() {
      newEmailsMining.name.should.equal('New EmailsMining');
      newEmailsMining.info.should.equal('This is the brand new emailsMining!!!');
    });
  });

  describe('GET /api/emails-minings/:id', function() {
    var emailsMining;

    beforeEach(function(done) {
      request(app)
        .get(`/api/emails-minings/${newEmailsMining._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          emailsMining = res.body;
          done();
        });
    });

    afterEach(function() {
      emailsMining = {};
    });

    it('should respond with the requested emailsMining', function() {
      emailsMining.name.should.equal('New EmailsMining');
      emailsMining.info.should.equal('This is the brand new emailsMining!!!');
    });
  });

  describe('PUT /api/emails-minings/:id', function() {
    var updatedEmailsMining;

    beforeEach(function(done) {
      request(app)
        .put(`/api/emails-minings/${newEmailsMining._id}`)
        .send({
          name: 'Updated EmailsMining',
          info: 'This is the updated emailsMining!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedEmailsMining = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedEmailsMining = {};
    });

    it('should respond with the updated emailsMining', function() {
      updatedEmailsMining.name.should.equal('Updated EmailsMining');
      updatedEmailsMining.info.should.equal('This is the updated emailsMining!!!');
    });

    it('should respond with the updated emailsMining on a subsequent GET', function(done) {
      request(app)
        .get(`/api/emails-minings/${newEmailsMining._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let emailsMining = res.body;

          emailsMining.name.should.equal('Updated EmailsMining');
          emailsMining.info.should.equal('This is the updated emailsMining!!!');

          done();
        });
    });
  });

  describe('PATCH /api/emails-minings/:id', function() {
    var patchedEmailsMining;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/emails-minings/${newEmailsMining._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched EmailsMining' },
          { op: 'replace', path: '/info', value: 'This is the patched emailsMining!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedEmailsMining = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedEmailsMining = {};
    });

    it('should respond with the patched emailsMining', function() {
      patchedEmailsMining.name.should.equal('Patched EmailsMining');
      patchedEmailsMining.info.should.equal('This is the patched emailsMining!!!');
    });
  });

  describe('DELETE /api/emails-minings/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/emails-minings/${newEmailsMining._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when emailsMining does not exist', function(done) {
      request(app)
        .delete(`/api/emails-minings/${newEmailsMining._id}`)
        .expect(404)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });
  });
});
