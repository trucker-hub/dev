'use strict';
const angular = require('angular');
const ngRoute = require('angular-route');


import routes from './email.routes';

export class EmailComponent {
  emails = [];

  monitoring = false;
  /*@ngInject*/
  constructor($http, socket) {
    this.$http = $http;
    this.socket = socket;
  }

  checkMonitoringStatus() {
    this.$http.get('/api/emails/isMonitoring', {})
      .then(response => {
        this.monitoring = (response.data.monitoring=='started');
      });
  }

  startMonitoring () {
    console.log("clicked to start monitoring");
    this.$http.post('/api/emails/startMonitoring', {})
      .then(response => {
        console.log("response", response);
        this.socket.syncUpdates('email', this.emails);
        this.monitoring = true;
      });
  }

  stopMonitoring () {
    console.log("clicked to stop monitoring");
      this.$http.post('/api/emails/stopMonitoring', {})
        .then(response => {
        console.log("response", response);
        this.monitoring = false;
    });
  }

  getEmails () {
    this.$http.get('/api/emails/').then(response => {
      this.emails = response.data;
      this.socket.syncUpdates('email', this.emails);
      console.log("response", response);
    });
  }
}

export default angular.module('truckingHubApp.email', [ngRoute])
  .config(routes)
  .component('email', {
    template: require('./email.html'),
    controller: EmailComponent,
    controllerAs: 'emailCtrl'
  })
  .name;
