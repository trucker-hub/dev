'use strict';
const angular = require('angular');
const ngRoute = require('angular-route');


import routes from './email-setting.routes';


export class EmailSettingComponent {

  emailAccounts = [];
  alerts = [];

  /*@ngInject*/
  constructor($http, $scope, socket) {
    this.$http = $http;
    this.socket = socket;
    this.$scope = $scope;

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('email-settings');
    });

    var self = this;
    this.socket.listen("emailSetting", function(doc) {
      console.log("receive socket message from server", doc);
      if(doc.type == 'testing') {
        self.emailAccounts.forEach(function (account, i) {
          if (account.username == doc.username) {
            self.emailAccounts[i].testing = doc.status;
          }
        });
      }
    });
  }

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

  testAccountPending(account) {
    return account.hasOwnProperty('testing') && account.testing.status=='pending';
  }

  testAccountGood(account) {
    return account.hasOwnProperty('testing') && account.testing.status=='passed';
  }

  testAccountFailed(account) {
    return account.hasOwnProperty('testing') && account.testing.status=='failed';
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
      changed:true,
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
    this.$http.post('/api/email-settings/test', account).then(response => {
      account.testing = response.status;
      self.alerts.push({msg: 'Email account ' + account.username + ' testing is !' + response.data, type: 'success'});
    }).catch(function (response) {
      account.testing = { status: 'failed'};
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
