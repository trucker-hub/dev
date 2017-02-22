'use strict';
const angular = require('angular');
const ngRoute = require('angular-route');


import routes from './email.routes';

export class EmailComponent {

  emails = [];
  monitoring;

  /*@ngInject*/
  constructor($http, $scope, socket) {
    this.$http = $http;
    this.socket = socket;

    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('email');
    });
  }
  
  startMonitoring () {
    console.log("clicked to start monitoring");
    this.$http.post('/api/emails/monitoring/start', {})
      .then(response => {
        console.log("response", response);
        this.socket.syncUpdates('email', this.emails);
        this.monitoring = true;
      });
  }

  stopMonitoring () {
    console.log("clicked to stop monitoring");
    this.$http.post('/api/emails/monitoring/stop', {})
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

  $onInit() {
    this.getEmails();
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
