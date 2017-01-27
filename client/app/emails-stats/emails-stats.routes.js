'use strict';

export default function($routeProvider) {
  'ngInject';
  $routeProvider
    .when('/emails-stats', {
      template: '<emails-stats></emails-stats>'
    });
}
