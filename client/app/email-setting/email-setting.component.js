'use strict';
const angular = require('angular');
const ngRoute = require('angular-route');


import routes from './email-setting.routes';

export class EmailSettingComponent {
  /*@ngInject*/
  constructor() {
    this.message = 'Hello';
  }
}

export default angular.module('devApp.emailSetting', [ngRoute])
  .config(routes)
  .component('emailSetting', {
    template: require('./email-setting.html'),
    controller: EmailSettingComponent,
    controllerAs: 'emailSettingCtrl'
  })
  .name;
