'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newEmailSetting;

describe('EmailSetting API:', function() {
  describe('GET /api/email-settings', function() {
    var emailSettings;

    beforeEach(function(done) {
      request(app)
        .get('/api/email-settings')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          emailSettings = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      emailSettings.should.be.instanceOf(Array);
    });
  });

  describe('POST /api/email-settings', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/email-settings')
        .send({
          name: 'New EmailSetting',
          info: 'This is the brand new emailSetting!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newEmailSetting = res.body;
          done();
        });
    });

    it('should respond with the newly created emailSetting', function() {
      newEmailSetting.name.should.equal('New EmailSetting');
      newEmailSetting.info.should.equal('This is the brand new emailSetting!!!');
    });
  });

  describe('GET /api/email-settings/:id', function() {
    var emailSetting;

    beforeEach(function(done) {
      request(app)
        .get(`/api/email-settings/${newEmailSetting._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          emailSetting = res.body;
          done();
        });
    });

    afterEach(function() {
      emailSetting = {};
    });

    it('should respond with the requested emailSetting', function() {
      emailSetting.name.should.equal('New EmailSetting');
      emailSetting.info.should.equal('This is the brand new emailSetting!!!');
    });
  });

  describe('PUT /api/email-settings/:id', function() {
    var updatedEmailSetting;

    beforeEach(function(done) {
      request(app)
        .put(`/api/email-settings/${newEmailSetting._id}`)
        .send({
          name: 'Updated EmailSetting',
          info: 'This is the updated emailSetting!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedEmailSetting = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedEmailSetting = {};
    });

    it('should respond with the updated emailSetting', function() {
      updatedEmailSetting.name.should.equal('Updated EmailSetting');
      updatedEmailSetting.info.should.equal('This is the updated emailSetting!!!');
    });

    it('should respond with the updated emailSetting on a subsequent GET', function(done) {
      request(app)
        .get(`/api/email-settings/${newEmailSetting._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let emailSetting = res.body;

          emailSetting.name.should.equal('Updated EmailSetting');
          emailSetting.info.should.equal('This is the updated emailSetting!!!');

          done();
        });
    });
  });

  describe('PATCH /api/email-settings/:id', function() {
    var patchedEmailSetting;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/email-settings/${newEmailSetting._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched EmailSetting' },
          { op: 'replace', path: '/info', value: 'This is the patched emailSetting!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedEmailSetting = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedEmailSetting = {};
    });

    it('should respond with the patched emailSetting', function() {
      patchedEmailSetting.name.should.equal('Patched EmailSetting');
      patchedEmailSetting.info.should.equal('This is the patched emailSetting!!!');
    });
  });

  describe('DELETE /api/email-settings/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/email-settings/${newEmailSetting._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when emailSetting does not exist', function(done) {
      request(app)
        .delete(`/api/email-settings/${newEmailSetting._id}`)
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
