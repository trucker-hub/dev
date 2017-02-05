'use strict';

export default function($routeProvider) {
  'ngInject';
  $routeProvider
    .when('/email', {
      template: '<email></email>'
    });
}
