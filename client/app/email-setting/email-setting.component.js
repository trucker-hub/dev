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
    this.socket.listen("emailSetting", function(event) {
      console.log("receive socket message from server", event);
      if(event.type == 'monitoring') {
        self.emailAccounts.forEach(function (account, i) {
          if (account.username == event.username) {
            self.emailAccounts[i].monitoring = event;
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

  accountNew(account) {
    return account.hasOwnProperty('monitoring') && account.monitoring.status=='';
  }

  accountPending(account) {
    return account.hasOwnProperty('monitoring') && account.monitoring.status=='pending';
  }

  accountRunning(account) {
    return account.hasOwnProperty('monitoring') && account.monitoring.status=='running';
  }

  accountFailed(account) {
    return account.hasOwnProperty('monitoring') && account.monitoring.status=='failed';
  }

  accountStopped(account) {
    return account.hasOwnProperty('monitoring') && account.monitoring.status=='stopped';
  }


  addEmptyAccount() {
    this.emailAccounts.push({
      username: "jinbo.chen@gmail.com",
      password: "chunfeng2",
      mailbox: "Inbox",
      host: "imap.gmail.com",
      port: 993,
      tls: true,
      monitoring: { status: ''},
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
    var self = this;
    if(start) {
      this.$http.post('/api/email-settings/start', account).then(response => {
        account.monitoring = response.data;
        self.alerts.push({msg: 'Email account ' + account.username + ' monitoring is !' + response.data, type: 'success'});
      }).catch(function (response) {
        account.monitoiring = { status: 'failed'};
        self.alerts.push({msg: 'Email account ' + account.username + ' monitoring failed' + response.data, type: 'danger'});
      });
    }else {
      this.$http.post('/api/email-settings/stop', account).then(response => {
        account.monitoring = response.data;
        self.alerts.push({msg: 'Stopping Email account monitoring ' + account.username  + response.data, type: 'success'});
      }).catch(function (response) {
        account.monitoring = { status: 'failed'};
        self.alerts.push({msg: 'Email account ' + account.username + ' monitoring failed' + response.data, type: 'danger'});
      });
    }
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
