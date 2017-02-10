'use strict';

describe('Filter: emailHistory', function() {
  // load the filter's module
  beforeEach(module('truckingHubApp.emailHistory'));

  // initialize a new instance of the filter before each test
  var emailHistory;
  beforeEach(inject(function($filter) {
    emailHistory = $filter('emailHistory');
  }));

  it('should return the input prefixed with "emailHistory filter:"', function() {
    var text = 'angularjs';
    expect(emailHistory(text)).toBe('emailHistory filter: ' + text);
  });
});
