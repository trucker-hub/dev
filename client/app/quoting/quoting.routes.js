'use strict';

export default function($routeProvider) {
  'ngInject';
  $routeProvider
    .when('/quoting', {
      template: '<quoting></quoting>'
    });
}
