'use strict';

var Imap = require('imap');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var MailParser = require("mailparser").MailParser;
const htmlToText = require('html-to-text');

var async = require('async');

module.exports = MailClient;

function MailClient(settings) {
  this.mailbox = settings.mailbox || "INBOX";
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

  this.imap.once('ready', imapReady.bind(this));
  this.imap.once('close', imapClose.bind(this));
  this.imap.on('error', imapError.bind(this));
}

util.inherits(MailClient, EventEmitter);

function imapClose() {
  this.emit('server:disconnected');
}

function imapError(err) {
  this.emit('error', err);
}

function imapMail() {
  parseEmail.call(this);
}


MailClient.prototype.start = function() {
  this.imap.connect();
};

MailClient.prototype.stop = function() {
  this.imap.end();
};

function imapReady() {
  var self = this;
  this.imap.openBox(this.mailbox, false, function(err, mailbox) {
    if (err) {
      self.emit('error', err);
    } else {
      self.emit('server:connected');
      var listener = imapMail.bind(self);
      self.imap.on('mail', listener);
      self.imap.on('update', listener);
    }
  });
}

function parseEmail() {
  var self = this;
  this.imap.search(self.searchFilter, function(err, results) {
    if (err) {
      self.emit('error', err);
    } else if (results.length > 0) {
      async.each(results, function( result, callback) {
        var f = self.imap.fetch(result, { bodies: '', markSeen: false });
        f.on('message', function(msg, seqno) {
          console.log("email received", msg);
          var parser = new MailParser(self.mailParserOptions);
          var attributes = null;
          var emlbuffer = new Buffer('');

          parser.on("end", function(mail) {
            mail.eml = emlbuffer.toString('utf-8');
            self.emit('mail',mail,seqno,attributes);
          });
          parser.on("attachment", function (attachment) {
            self.emit('attachment', attachment);
          });
          msg.on('body', function(stream, info) {
            stream.on('data', function(chunk) {
              emlbuffer = Buffer.concat([emlbuffer, chunk]);
            });
            stream.once('end', function() {
              parser.write(emlbuffer);
              parser.end();
            });
          });
          msg.on('attributes', function(attrs) {
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

