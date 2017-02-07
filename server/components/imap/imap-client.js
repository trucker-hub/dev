'use strict';

var Imap = require('imap');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var MailParser = require("mailparser").MailParser;
const htmlToText = require('html-to-text');

var async = require('async');

module.exports = MailClient;

function MailClient(settings) {
  var self = this;
  this.mailbox = settings.mailbox || "INBOX";
  this.connected = false;
  if ('string' === typeof settings.searchFilter) {
    this.searchFilter = [settings.searchFilter];
  } else {
    this.searchFilter = settings.searchFilter || ["UNSEEN"];
  }

  this.mailParserOptions = settings.mailParserOptions || {};
  this.imap = new Imap({
    xoauth2: settings.xoauth2,
    user: settings.username,
    password: settings.password,
    host: settings.host,
    port: settings.port,
    tls: settings.options.tls,
    mailParserOptions: { streamAttachments: true },
    tlsOptions: settings.options.tlsOptions || {},
    connTimeout: settings.options.connTimeout || null,
    authTimeout: settings.options.authTimeout || null,
    debug: (settings.options.debug?console.log: null)
  });

  this.imap.once('ready', () => {
    imapReady(self);
  });
  this.imap.once('close', () => {
    self.emit('server:disconnected');
    self.connected = false;
    if(settings.options.keepConnected) {
      self.start();
    }
  });
  this.imap.on('error', (err) => {
    self.emit('error', err);
  });
}

util.inherits(MailClient, EventEmitter);


MailClient.prototype.start = function() {
  this.imap.connect();
};

MailClient.prototype.stop = function() {
  this.imap.end();
};


MailClient.prototype.startReceiving = function(callback) {
  this.start();
  this.on('mail', function(input,seqno,attributes) {
    console.log("mail received!", seqno, attributes);

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

    callback(input);
  });
};

function imapReady(self) {

  self.imap.openBox(self.mailbox, false, function(err, mailbox) {
    if (err) {
      self.emit('error', err);
    } else {
      self.emit('server:connected');
      self.connected = true;
      //var listener = imapMail.bind(self);
      self.imap.on('mail', () => {
        console.log("==> check email due to mail event");
        parseEmail(self);
      } );
      self.imap.on('update', () => {
        console.log("==> check email due to update event");
        parseEmail(self);
      } );
    }
  });
}

function parseEmail(self) {

  self.imap.search(self.searchFilter, function(err, results) {
    if (err) {
      self.emit('error', err);
    } else if (results.length > 0) {
      async.each(results, function( result, callback) {
        //console.log("result", result);
        var f = self.imap.fetch(result, { bodies: '', markSeen: false });
        f.on('message', function(msg, seqno) {
          //console.log("email received", seqno);
          var parser = new MailParser(self.mailParserOptions);
          var attributes = null;
          var emlbuffer = new Buffer('');

          parser.on("end", function(mail) {
            //console.log("email end", mail);
            mail.eml = emlbuffer.toString('utf-8');
            self.emit('mail',mail,seqno,attributes);
          });
          parser.on("attachment", function (attachment) {
            //console.log("attachment received", attachment);
            self.emit('attachment', attachment);
          });
          msg.on('body', function(stream, info) {
            //console.log("email body", info);
            stream.on('data', function(chunk) {
              emlbuffer = Buffer.concat([emlbuffer, chunk]);
            });
            stream.once('end', function() {
              parser.write(emlbuffer);
              parser.end();
            });
          });
          msg.on('attributes', function(attrs) {
            //console.log("attachment received", attrs);
            attributes = attrs;
          });
        });
        f.once('error', function(err) {
          self.emit('error', err);
        });
      }, function(err){
        if( err ) {
          self.emit('error', err);
        }
      });
    }
  });
}

