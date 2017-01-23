'use strict';
const angular = require('angular');
const ngRoute = require('angular-route');


import routes from './quoting.routes';

export class QuotingComponent {
  /*@ngInject*/
  constructor() {
    this.message = 'Hello';
  }
}

export default angular.module('devApp.quoting', [ngRoute])
  .config(routes)
  .component('quoting', {
    template: require('./quoting.html'),
    controller: QuotingComponent,
    controllerAs: 'quotingCtrl'
  })
  .name;
