'use strict';

describe('Filter: emailAddress', function() {
  // load the filter's module
  beforeEach(module('truckingHubApp.emailAddress'));

  // initialize a new instance of the filter before each test
  var emailAddress;
  beforeEach(inject(function($filter) {
    emailAddress = $filter('email-address');
  }));

  it('should return the input prefixed with "emailAddress filter:"', function() {
    var text = [{address:"jinbo.chen@gmail.com", name: "Jinbo Chen"}, { address:"lan@cc-chb.com", name:''}];
    expect(emailAddress(text)).toBe('"Jinbo Chen" <jinbo.chen@gmail.com>, <lan@cc-chb.com>');
  });
});
