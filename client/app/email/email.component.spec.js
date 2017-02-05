'use strict';

describe('Component: EmailComponent', function() {
  // load the controller's module
  beforeEach(module('truckingHubApp.email'));

  var EmailComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    EmailComponent = $componentController('email', {});
  }));

  it('should ...', function() {
    expect(1).toEqual(1);
  });
});
