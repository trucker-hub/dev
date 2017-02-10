'use strict';

export default function($routeProvider) {
  'ngInject';
  $routeProvider
    .when('/email-setting', {
      template: '<email-setting></email-setting>'
    });
}
