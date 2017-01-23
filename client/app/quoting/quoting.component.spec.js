'use strict';

describe('Component: QuotingComponent', function() {
  // load the controller's module
  beforeEach(module('devApp.quoting'));

  var QuotingComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    QuotingComponent = $componentController('quoting', {});
  }));

  it('should ...', function() {
    expect(1).toEqual(1);
  });
});
