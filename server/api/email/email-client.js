/**
 * Created by jinbochen on 1/30/17.
 */
'use strict';

const util = require('util');
const Listener = require('../../components/imap/index');
const MailClient = require('../../components/imap/imap-client');
const htmlToText = require('html-to-text');

/*
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
*/
var client = new MailClient({
  username: "jinbo.chen@gmail.com",
  password: "chunfeng2",
  host: "imap.gmail.com",
  port: 993, // imap port
  mailbox: "Inbox", // mailbox to monitor
  searchFilter: ['UNSEEN'],
  options: {
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
    debug: true,
    connTimeout: 10000, // Default by node-imap
    authTimeout: 5000, // Default by node-imap,
    keepConnected: false
  }
});


client.start(); // start listening

client.on("server:connected", function () {
  console.log("imapConnected");
  console.log("listener state", client.imap.state);
});

client.on("server:disconnected", function () {
  console.log("imapDisconnected");
  //re-start if not initiated by the call
});

client.on("error", function (err) {
  console.log(err);
});

client.on("attachment", function (attachment) {
  //console.log("attachment received!");
});

client.on("mail", function (input, seqno, attributes) {
  // do something with mail object including attachments
  //console.log("mail received!", seqno, attributes);

  //1. convert html to text
  //2. summarize attachment info (name, type, size)

  if (input.attachments) {
    var attachments = [];
    for (var i = 0; i < input.attachments.length; ++i) {
      var attachment = input.attachments[i];
      attachments.push({name: attachment.fileName, type: attachment.contentType, size: attachment.length});
    }
    input.attachments = attachments;
  }

  if (input.html) {
    input.text = htmlToText.fromString(input.html);
    delete input.html;
  }

  if (input.eml) {
    delete input.eml;
  }

  console.log("email=", input.subject, input.attachments, seqno);

});


