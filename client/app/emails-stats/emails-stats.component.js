'use strict';
const angular = require('angular');
const ngRoute = require('angular-route');
import routes from './emails-stats.routes';

export class EmailsStatsComponent {
  emails = [
    {
      subject: "Hello 1"
    }, {
      subject: "Hello 2"
    }];
  monitoring = false;

  /*@ngInject*/
  constructor($http, socket) {
    this.$http = $http;
    this.socket = socket;
  }

  startMonitoring () {
    console.log("clicked to start monitoring");
    this.$http.post('/api/emails-minings/start-monitoring', {})
        .then(response => {
          console.log("response", response);
          this.socket.syncUpdates('email', this.emails);
          this.monitoring = true;
        });
  }

  stopMonitoring () {
    console.log("clicked to stop monitoring");
      this.$http.post('/api/emails-minings/stop-monitoring', {

      }).then(response => {
        console.log("response", response);
        this.monitoring = false;
      });
  }

  getEmails () {
    this.$http.get('/api/emails-minings/').then(response => {
      this.emails = response.data;
      this.socket.syncUpdates('email', this.emails);
      console.log("response", response);
    });
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
