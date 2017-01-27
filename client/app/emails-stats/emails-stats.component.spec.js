'use strict';

describe('Component: EmailsStatsComponent', function() {
  // load the controller's module
  beforeEach(module('truckingHubApp.emails-stats'));

  var EmailsStatsComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    EmailsStatsComponent = $componentController('emails-stats', {});
  }));

  it('should ...', function() {
    expect(1).toEqual(1);
  });
});
