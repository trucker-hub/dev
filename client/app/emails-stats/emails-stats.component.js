'use strict';
const angular = require('angular');
const ngRoute = require('angular-route');


import routes from './emails-stats.routes';

export class EmailsStatsComponent {
  /*@ngInject*/
  constructor() {
    this.message = 'Hello';
  }
}

export default angular.module('truckingHubApp.emails-stats', [ngRoute])
  .config(routes)
  .component('emailsStats', {
    template: require('./emails-stats.html'),
    controller: EmailsStatsComponent,
    controllerAs: 'emailsStatsCtrl'
  })
  .name;
