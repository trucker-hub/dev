'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newEmail;

describe('Email API:', function() {
  describe('GET /api/emails', function() {
    var emails;

    beforeEach(function(done) {
      request(app)
        .get('/api/emails')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          emails = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      emails.should.be.instanceOf(Array);
    });
  });

  describe('POST /api/emails', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/emails')
        .send({
          name: 'New Email',
          info: 'This is the brand new email!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newEmail = res.body;
          done();
        });
    });

    it('should respond with the newly created email', function() {
      newEmail.name.should.equal('New Email');
      newEmail.info.should.equal('This is the brand new email!!!');
    });
  });

  describe('GET /api/emails/:id', function() {
    var email;

    beforeEach(function(done) {
      request(app)
        .get(`/api/emails/${newEmail._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          email = res.body;
          done();
        });
    });

    afterEach(function() {
      email = {};
    });

    it('should respond with the requested email', function() {
      email.name.should.equal('New Email');
      email.info.should.equal('This is the brand new email!!!');
    });
  });

  describe('PUT /api/emails/:id', function() {
    var updatedEmail;

    beforeEach(function(done) {
      request(app)
        .put(`/api/emails/${newEmail._id}`)
        .send({
          name: 'Updated Email',
          info: 'This is the updated email!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedEmail = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedEmail = {};
    });

    it('should respond with the updated email', function() {
      updatedEmail.name.should.equal('Updated Email');
      updatedEmail.info.should.equal('This is the updated email!!!');
    });

    it('should respond with the updated email on a subsequent GET', function(done) {
      request(app)
        .get(`/api/emails/${newEmail._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let email = res.body;

          email.name.should.equal('Updated Email');
          email.info.should.equal('This is the updated email!!!');

          done();
        });
    });
  });

  describe('PATCH /api/emails/:id', function() {
    var patchedEmail;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/emails/${newEmail._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Email' },
          { op: 'replace', path: '/info', value: 'This is the patched email!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedEmail = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedEmail = {};
    });

    it('should respond with the patched email', function() {
      patchedEmail.name.should.equal('Patched Email');
      patchedEmail.info.should.equal('This is the patched email!!!');
    });
  });

  describe('DELETE /api/emails/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/emails/${newEmail._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when email does not exist', function(done) {
      request(app)
        .delete(`/api/emails/${newEmail._id}`)
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
