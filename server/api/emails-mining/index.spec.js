'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var emailsMiningCtrlStub = {
  index: 'emailsMiningCtrl.index',
  show: 'emailsMiningCtrl.show',
  create: 'emailsMiningCtrl.create',
  upsert: 'emailsMiningCtrl.upsert',
  patch: 'emailsMiningCtrl.patch',
  destroy: 'emailsMiningCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var emailsMiningIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './emails-mining.controller': emailsMiningCtrlStub
});

describe('EmailsMining API Router:', function() {
  it('should return an express router instance', function() {
    emailsMiningIndex.should.equal(routerStub);
  });

  describe('GET /api/emails-minings', function() {
    it('should route to emailsMining.controller.index', function() {
      routerStub.get
        .withArgs('/', 'emailsMiningCtrl.index')
        .should.have.been.calledOnce;
    });
  });

  describe('GET /api/emails-minings/:id', function() {
    it('should route to emailsMining.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'emailsMiningCtrl.show')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/emails-minings', function() {
    it('should route to emailsMining.controller.create', function() {
      routerStub.post
        .withArgs('/', 'emailsMiningCtrl.create')
        .should.have.been.calledOnce;
    });
  });

  describe('PUT /api/emails-minings/:id', function() {
    it('should route to emailsMining.controller.upsert', function() {
      routerStub.put
        .withArgs('/:id', 'emailsMiningCtrl.upsert')
        .should.have.been.calledOnce;
    });
  });

  describe('PATCH /api/emails-minings/:id', function() {
    it('should route to emailsMining.controller.patch', function() {
      routerStub.patch
        .withArgs('/:id', 'emailsMiningCtrl.patch')
        .should.have.been.calledOnce;
    });
  });

  describe('DELETE /api/emails-minings/:id', function() {
    it('should route to emailsMining.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'emailsMiningCtrl.destroy')
        .should.have.been.calledOnce;
    });
  });
});
