'use strict';

describe('Component: EmailSettingComponent', function() {
  // load the controller's module
  beforeEach(module('devApp.emailSetting'));

  var EmailSettingComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    EmailSettingComponent = $componentController('email-setting', {});
  }));

  it('should ...', function() {
    expect(1).toEqual(1);
  });
});
