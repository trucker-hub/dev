'use strict';
const angular = require('angular');
const ngRoute = require('angular-route');


import routes from './email-setting.routes';

export class EmailSettingComponent {
  /*@ngInject*/
  emailAccounts = [{
    username:"jinbo.chen@gmail.com",
    password:"xxxxx",
    mailbox:"Inbox",
    host:"imap.abc.com",
    port:993,
    tls:true,
    monitor:false,
    debugging: true
  }];
  pendingEmailAccount = null;

  constructor($http, $scope, socket) {
    this.$http = $http;
    this.socket = socket;

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('email-settings');
    });
  }

  /**
   * router.get('/', controller.index);
   router.get('/:id', controller.show);
   router.post('/', controller.create);
   router.put('/:id', controller.upsert);
   router.patch('/:id', controller.patch);
   router.delete('/:id', controller.destroy);
   */
  getEmailAccounts() {
    var self = this;
    this.$http.get('/api/email-settings')
      .then(response => {
        self.emailAccounts = response.data;
      });
  }

  addEmailAccount() {
    var self = this;
    this.$http.post('/api/email-settings', this.pendingEmailAccount)
      .then(response => {
        self.pendingEmailAccount = response.data;
      });
  }

  removeEmailAccount() {
    var self = this;
    this.$http.delete('/api/email-settings/' + this.pendingEmailAccount._id)
      .then(response => {
        console.log("response=", response);
        self.pendingEmailAccount = null;
      });
  }

  updateEmailAccount() {
    var self = this;
    this.$http.put('/api/email-settings/'+this.pendingEmailAccount._id, this.pendingEmailAccount)
      .then(response => {
        self.pendingEmailAccount = response.data;
      });
  }

  saveAccount(account) {
    console.log("save account=", account.username);
  }

  monitorAccount(account, start) {
    console.log("mount account [", account.username, "]", start);
  }

  deleteAccount(account) {
    console.log("delete account=", account.username);
  }
  $onInit() {
    //this.getEmailAccounts();
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
