'use strict';
const angular = require('angular');
const ngRoute = require('angular-route');


import routes from './email-setting.routes';

export class EmailSettingComponent {

  emailAccounts = [];
  alerts = [];
  /*  [
   {
   _id: 'xkskskakakakakak',
   username: "jinbo.chen@gmail.com",
   password: "xxxxx",
   mailbox: "Inbox",
   host: "imap.abc.com",
   port: 993,
   tls: true,
   monitoring: false,
   testing: {
   status: false
   },
   debugging: true
   },
   {
   username: "jinbo.chen@gmail.com",
   password: "xxxxx",
   mailbox: "Inbox",
   host: "imap.abc.com",
   port: 993,
   tls: true,
   monitoring: false,
   testing: {
   status: true
   },
   debugging: true
   }];*/

  /*@ngInject*/
  constructor($http, $scope, socket) {
    this.$http = $http;
    this.socket = socket;
    this.$scope = $scope;

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

  isExistingAccount(account) {
    return account.hasOwnProperty('_id');
  }

  isAccountChanged(account) {
    return account.hasOwnProperty('changed') && account.changed;
  }

  addEmptyAccount() {
    this.emailAccounts.push({
      username: "jinbo.chen@gmail.com",
      password: "chunfeng2",
      mailbox: "Inbox",
      host: "imap.gmail.com",
      port: 993,
      tls: true,
      monitoring: false,
      debugging: true
    });
  }

  updateAccountWith(response) {
    var saved = response.data;
    var self = this;
    self.emailAccounts.forEach(function (email, i) {
      if (email.username == saved.username) {
        self.emailAccounts[i] = saved;
      }
    });
  };

  updateAccount(account) {
    var self = this;
    console.log("account=", account);
    this.$http.put('/api/email-settings/' + account._id, account)
      .then(response => {
        self.updateAccountWith(response);
        self.alerts.push({msg: 'Email account ' + account.username + ' has been updated!', type: 'success'});
      }).catch(function (response) {
        console.log("response", response);
        self.alerts.push({msg: 'Email account ' + account.username + ' did not got updated!', type: 'danger'});
    })
  }

  saveAccount(account) {
    console.log("save account=", account.username);
    var self = this;
    this.$http.post('/api/email-settings', account).then(response => {
      self.updateAccountWith(response);
      self.alerts.push({msg: 'Email account ' + account.username + ' has been saved!', type: 'success'});
    }).catch(function (response) {
      self.alerts.push({msg: 'Email account ' + account.username + ' did not got saved!', type: 'danger'});
    });
  }

  monitorAccount(account, start) {
    console.log("monitor account [", account.username, "]", start);
  }

  deleteAccount(account) {
    console.log("delete account=", account.username);
    var self = this;
    this.$http.delete('/api/email-settings/' + account._id)
      .then(response => {
        self.getEmailAccounts();
        self.alerts.push({msg: 'Email account ' + account.username + ' has been deleted!', type: 'success'});
      }).catch(response => {
        self.alerts.push({msg: 'Email account ' + account.username + ' did not got deleted!', type: 'danger'});
    });
  }

  closeAlert = function(index) {
    this.alerts.splice(index, 1);
  };

  testAccount(account) {
    this.$http.post('/api/emails/monitoring/test', account).then(response => {
      account.testing = response.data;
      self.alerts.push({msg: 'Email account ' + account.username + ' testing is !' + response.data, type: 'success'});
    }).catch(function (response) {
      self.alerts.push({msg: 'Email account ' + account.username + ' testing failed' + response.data, type: 'danger'});
    });
  }

  $onInit() {
    this.getEmailAccounts();
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
