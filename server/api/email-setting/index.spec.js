'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var emailSettingCtrlStub = {
  index: 'emailSettingCtrl.index',
  show: 'emailSettingCtrl.show',
  create: 'emailSettingCtrl.create',
  upsert: 'emailSettingCtrl.upsert',
  patch: 'emailSettingCtrl.patch',
  destroy: 'emailSettingCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var emailSettingIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './email-setting.controller': emailSettingCtrlStub
});

describe('EmailSetting API Router:', function() {
  it('should return an express router instance', function() {
    emailSettingIndex.should.equal(routerStub);
  });

  describe('GET /api/email-settings', function() {
    it('should route to emailSetting.controller.index', function() {
      routerStub.get
        .withArgs('/', 'emailSettingCtrl.index')
        .should.have.been.calledOnce;
    });
  });

  describe('GET /api/email-settings/:id', function() {
    it('should route to emailSetting.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'emailSettingCtrl.show')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/email-settings', function() {
    it('should route to emailSetting.controller.create', function() {
      routerStub.post
        .withArgs('/', 'emailSettingCtrl.create')
        .should.have.been.calledOnce;
    });
  });

  describe('PUT /api/email-settings/:id', function() {
    it('should route to emailSetting.controller.upsert', function() {
      routerStub.put
        .withArgs('/:id', 'emailSettingCtrl.upsert')
        .should.have.been.calledOnce;
    });
  });

  describe('PATCH /api/email-settings/:id', function() {
    it('should route to emailSetting.controller.patch', function() {
      routerStub.patch
        .withArgs('/:id', 'emailSettingCtrl.patch')
        .should.have.been.calledOnce;
    });
  });

  describe('DELETE /api/email-settings/:id', function() {
    it('should route to emailSetting.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'emailSettingCtrl.destroy')
        .should.have.been.calledOnce;
    });
  });
});
