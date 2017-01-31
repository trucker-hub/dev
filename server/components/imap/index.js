/**
 * Created by jinbochen on 1/30/17.
 */

/**
 * Created by jinbochen on 1/30/17.
 */
'use strict';

const MailListener = require('mail-listener2');

var mailListener = new MailListener({
  username: "jinbo.chen@gmail.com",
  password: "chunfeng2",
  host: "imap.gmail.com",
  port: 993, // imap port
  tls: true,
  connTimeout: 10000, // Default by node-imap
  authTimeout: 5000, // Default by node-imap,
  debug: console.log, // Or your custom function with only one incoming argument. Default: null
  tlsOptions: { rejectUnauthorized: false },
  mailbox: "Inbox", // mailbox to monitor
  searchFilter: ["UNSEEN"], // the search filter being used after an IDLE notification has been retrieved
  markSeen: false, // all fetched email willbe marked as seen and not fetched next time
  fetchUnreadOnStart: false, // use it only if you want to get all unread email on lib start. Default is `false`,
  mailParserOptions: {streamAttachments: true}, // options to be passed to mailParser lib.
  attachments: false, // download attachments as they are encountered to the project directory
  attachmentOptions: { directory: "attachments/" } // specify a download directory for attachments
});

module.exports =  {
  start : function(callback) {
    mailListener.start(); // start listening

    mailListener.on("server:connected", function(){
      console.log("imapConnected");
    });

    mailListener.on("server:disconnected", function(){
      console.log("imapDisconnected");
    });

    mailListener.on("error", function(err){
      console.log(err);
    });

    mailListener.on("mail", function(input, seqno, attributes){
      // do something with mail object including attachments
      console.log("mail received!");
      // console.log("== Email Received ==", input);
      callback(input);
      // mail processing code goes here

      //simpleParser(input).then(mail => {
      //    console.log("==== Email parsed via Simple Parser =====")
      //    console.log(util.inspect(mail, false, 22));
      //}).catch (err => {
      //    console.log(err);
      //});

    });

    mailListener.on("attachment", function(attachment){
      console.log("attachment received!");
      console.log(attachment.path);
    });
  },
  stop: function() {
    // stop listening
    mailListener.stop();
  }
};


