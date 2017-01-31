/**
 * Created by jinbochen on 1/30/17.
 */

/**
 * Created by jinbochen on 1/30/17.
 *       username: "jinbo.chen@gmail.com",
 password: "chunfeng2",
 host: "imap.gmail.com",
 port: 993, // imap port
 tls: true,
 connTimeout: 10000, // Default by node-imap
 authTimeout: 5000, // Default by node-imap,
 debug: console.log, // Or your custom function with only one incoming argument. Default: null
 tlsOptions: { rejectUnauthorized: false },
 mailbox: "Inbox", // mailbox to monitor
 */
'use strict';

const MailListener = require('mail-listener2');
const htmlToText = require('html-to-text');

var listener;

module.exports =  {

  init: function(username, password, host, port, mailbox) {
    listener= new MailListener({
      username: username,
      password: password,
      host: host,
      port: port, // imap port
      tls: true,
      connTimeout: 10000, // Default by node-imap
      authTimeout: 5000, // Default by node-imap,
      debug: console.log, // Or your custom function with only one incoming argument. Default: null
      tlsOptions: { rejectUnauthorized: false },
      mailbox: mailbox, // mailbox to monitor
      searchFilter: ["UNSEEN", "UNANSWERED"], // the search filter being used after an IDLE notification has been retrieved
      markSeen: false, // all fetched email willbe marked as seen and not fetched next time
      fetchUnreadOnStart: false, // use it only if you want to get all unread email on lib start. Default is `false`,
      mailParserOptions: { streamAttachments: true }, // options to be passed to mailParser lib.
      attachments: false, // download attachments as they are encountered to the project directory
      attachmentOptions: { directory: "attachments/" } // specify a download directory for attachments
    });
  },

  start : function(callback) {
    listener.start(); // start listening

    listener.on("server:connected", function(){
      console.log("imapConnected");
    });

    listener.on("server:disconnected", function(){
      console.log("imapDisconnected");
    });

    listener.on("error", function(err){
      console.log(err);
    });

    listener.on("mail", function(input, seqno, attributes){
      // do something with mail object including attachments
      console.log("mail received!", seqno, attributes);
      // console.log("== Email Received ==", input);

      //1. convert html to text
      //2. summarize attachment info (name, type, size)

      if(input.attachments) {
        var attachments = [];
        for(var i=0; i < input.attachments.length; ++i) {
          var attachment = input.attachments[i];
          attachments.push({name: attachment.fileName, type: attachment.contentType, size: attachment.length});
        }
        input.attachments = attachments;
      }

      if(!input.text && input.html) {
        input.text = htmlToText.fromString(input.html);
      }

      if(input.eml) {
        delete input.eml;
      }

      callback(input);

    });

    listener.on("attachment", function(attachment){
      console.log("attachment received!");
    });
  },
  stop: function() {
    // stop listening
    listener.stop();
  }
};


