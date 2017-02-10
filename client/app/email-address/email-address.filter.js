'use strict';
const angular = require('angular');

/*@ngInject*/
export function emailAddressFilter() {
  return function(input) {
    var result= input.map(email => {
      return formatEmail(email);
    });
    return result.join(" ,");
  };
}

var formatEmail = function(email) {
  if(email.name) {
    return "\"" + email.name + "\" <" + email.address + ">";
  }else {
    return "<" + email.address + ">";
  }
};

export default angular.module('truckingHubApp.emailAddress', [])
  .filter('emailAddress', emailAddressFilter)
  .name;
