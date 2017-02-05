'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var emailCtrlStub = {
  index: 'emailCtrl.index',
  show: 'emailCtrl.show',
  create: 'emailCtrl.create',
  upsert: 'emailCtrl.upsert',
  patch: 'emailCtrl.patch',
  destroy: 'emailCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var emailIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './email.controller': emailCtrlStub
});

describe('Email API Router:', function() {
  it('should return an express router instance', function() {
    emailIndex.should.equal(routerStub);
  });

  describe('GET /api/emails', function() {
    it('should route to email.controller.index', function() {
      routerStub.get
        .withArgs('/', 'emailCtrl.index')
        .should.have.been.calledOnce;
    });
  });

  describe('GET /api/emails/:id', function() {
    it('should route to email.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'emailCtrl.show')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/emails', function() {
    it('should route to email.controller.create', function() {
      routerStub.post
        .withArgs('/', 'emailCtrl.create')
        .should.have.been.calledOnce;
    });
  });

  describe('PUT /api/emails/:id', function() {
    it('should route to email.controller.upsert', function() {
      routerStub.put
        .withArgs('/:id', 'emailCtrl.upsert')
        .should.have.been.calledOnce;
    });
  });

  describe('PATCH /api/emails/:id', function() {
    it('should route to email.controller.patch', function() {
      routerStub.patch
        .withArgs('/:id', 'emailCtrl.patch')
        .should.have.been.calledOnce;
    });
  });

  describe('DELETE /api/emails/:id', function() {
    it('should route to email.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'emailCtrl.destroy')
        .should.have.been.calledOnce;
    });
  });
});
