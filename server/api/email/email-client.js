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
      }},

    function(input) {
      console.log("new email=", input.subject, input.seqno);
    },

    function(seqno) {
      console.log("email seqno " + seqno + " got deleted");
    }
);


client.start(); // start listening






