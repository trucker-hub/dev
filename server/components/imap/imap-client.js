'use strict';

var Imap = require('imap');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var MailParser = require("mailparser").MailParser;
const htmlToText = require('html-to-text');

var async = require('async');
var HashTable = require('hashtable');

/**
 * Callbacks for NEW, UPDATE (READ, FLAGGED), DELETE
 * @type {MailClient}
 */

module.exports = MailClient;

function MailClient(settings, newCB, updateCB, delCB) {
  var self = this;
  this.cached = new HashTable();
  this.mailbox = settings.mailbox || "INBOX";
  this.newCB = newCB;
  this.updateCB = updateCB;
  this.delCB = delCB;
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

  this.on('mail-new', function(email, seqno, attributes) {
    //console.log("mail received!", seqno, attributes);
    //1. convert html to text
    //2. summarize attachment info (name, type, size)

    if (email.attachments) {
      var attachments = [];
      for (var i = 0; i < email.attachments.length; ++i) {
        var attachment = email.attachments[i];
        attachments.push({name: attachment.fileName, type: attachment.contentType, size: attachment.length});
      }
      email.attachments = attachments;
    }

    if (email.html && !email.text) {
      email.text = htmlToText.fromString(email.html);
    }

    if (email.eml) {
      delete email.eml;
    }
    email.seqno = seqno;
    email.uid = attributes.uid;
    email.history = [{flags: attributes.flags, date: new Date()}];
    self.cached.put(seqno, email);
    self.newCB(email);
  });

  this.on('mail-update', function(uid, seqno, attributes) {
    var email = self.cached.get(seqno);
    if(email) {
      email.history.push({flags: attributes.flags, date: new Date()});
      console.log("email["+ email.subject + "] flags got updated");
      self.updateCB(email);
    }
  });
}

util.inherits(MailClient, EventEmitter);


MailClient.prototype.start = function() {
  this.imap.connect();
};

MailClient.prototype.stop = function() {
  this.imap.end();
};

function imapReady(self) {

  self.imap.openBox(self.mailbox, false, function(err, mailbox) {
    if (err) {
      self.emit('error', err);
    } else {
      self.emit('server:connected');
      self.connected = true;
      checkEmails(self);
      self.imap.on('mail', () => {
        console.log("==> check email due to mail event");
        checkEmails(self);
      } );
      self.imap.on('expunge', (seqno) => {
        console.log("==> check email due to delete event", seqno);
        var email = self.cached.get(seqno);
        if(email) {
          email.history.push({flags: ['\\Deleted'], date: new Date()});
          console.log("email["+ email.subject + "] got deleted");
          self.delCB(email);
        }else {
          // if not in the cached, we probably don't care about them any more.
          console.log("email segno =" + seqno + " is no longer existing in the cached");
        }

      });

      self.imap.on('update', (seqno) => {
        console.log("==> !!! check email due to update event", seqno);
        var email = self.cached.get(seqno);
        if(email) {
          console.log("email["+ email.subject + "] has been updated, checking its flags");
          updateEmail(self, email.uid);
        }else {
          // if not in the cached, we probably don't care about them any more.
          console.log("email segno =" + seqno + " is no longer existing in the cached");
        }
      });
    }
  });
}

function updateEmail(self, uid) {
  var f = self.imap.fetch(uid, { bodies: '', markSeen: false });
  console.log("Update email for UID=", uid);
  f.on('message', function(msg, seqno) {
    //console.log("email received", seqno);
    console.log("SEGNO=", seqno);

    msg.on('attributes', function(attrs) {
      console.log("updated attributes received", attrs);
      self.emit("mail-update", uid, seqno, attrs);
    });
  });
  f.once('error', function(err) {
    self.emit('error', err);
  });
}

function fetchEmail(self, uid) {
  var f = self.imap.fetch(uid, { bodies: '', markSeen: false });
  console.log("Fetch new email for UID=", uid);
  f.on('message', function(msg, seqno) {
    //console.log("email received", seqno);
    console.log("SEGNO=", seqno);
    var parser = new MailParser(self.mailParserOptions);
    var attributes = null;
    var emlbuffer = new Buffer('');

    parser.on("end", function(mail) {
      //console.log("email end", mail);
      mail.eml = emlbuffer.toString('utf-8');
      self.emit('mail-new',mail,seqno,attributes);
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
}

function checkEmails(self) {

  self.imap.search(self.searchFilter, function(err, uids) {
    if (err) {
      self.emit('error', err);
    } else if (uids.length > 0) {
      async.each(uids, function( uid, callback) {
        fetchEmail(self, uid);
      });
    }
  });
}

