/**
 * Created by jinbochen on 1/30/17.
 */
'use strict';

const util = require('util');
const Listener = require('../../components/imap/index');

//listener.init("jinbo.chen@gmail.com", "chunfeng2", "imap.gmail.com", 993, "Inbox");
var listener1 = Listener.createListener("lan@cc-chb.com", "edcrfv9111", "imap.secureserver.net", 993,
  "Inbox", ["UNSEEN"], true);
var listener2 = Listener.createListener("lan@cc-chb.com", "edcrfv9111", "imap.secureserver.net", 993,
  "Sent Items", ["ALL", ['SINCE', 'Feb 1, 2017']]);


Listener.startListener(listener1, false, function (email) {
    console.log("INBOX EMAIL from", email.from, email.subject);
    //console.log(util.inspect(email, {depth: null, colors: true}));
}).then(function() {
  console.log("start INBOX listener successfully!")
});

Listener.startListener(listener2, false, function (email) {
  console.log("Sent Box EMAIL from", email.to, email.subject);
  //console.log(util.inspect(email, {depth: null, colors: true}));
}).then(function() {
  console.log("start Sent Items listener successfully!")
});
