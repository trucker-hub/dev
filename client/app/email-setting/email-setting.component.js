'use strict';
const angular = require('angular');
const ngRoute = require('angular-route');


import routes from './email-setting.routes';

export class EmailSettingComponent {
  /*@ngInject*/
  emailAccounts = [
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

  isExistingAccount(account) {
    return account.hasOwnProperty('_id');
  }

  isAccountChanged(account) {
    return account.hasOwnProperty('changed') && account.changed;
  }


  updateEmailAccount(account) {
    var self = this;
    this.$http.put('/api/email-settings/' + account._id, account)
        .then(response => {
          var saved = response.data;
          self.emailAccounts.forEach(function (email, i) {
            if (email.username == saved.username) {
              self.emailAccounts[i] = saved;
            }
          });
        }).catch(function (response) {
      // show an alert
    });
  }

  saveAccount(account) {
    console.log("save account=", account.username);
    var self = this;
    this.$http.post('/api/email-settings', account).then(response => {
      var saved = response.data;
      self.emailAccounts.forEach(function (email, i) {
        if (email.username == saved.username) {
          self.emailAccounts[i] = saved;
        }
      });
    }).catch(function (response) {
      // show an alert
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
        });
  }

  testAccount(account) {
    console.log("test account=", account.username);
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
