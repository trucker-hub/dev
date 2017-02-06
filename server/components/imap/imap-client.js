'use strict';

import Imap from 'imap';
import util from 'util';

/**
 * function of imap-client
 * 1. monitor InBox by IDLE
 * 2. search other folders (Sent, Delete)
 */
var imap = new Imap({
  user: 'mygmailname@gmail.com',
  password: 'mygmailpassword',
  host: 'imap.gmail.com',
  port: 993,
  tls: true
});

function client () {
  var self = this;
  var imap;
  this.init = function(username, password, host, port, mailbox, filter, debug) {
    this.username = username;
    this.password = password;
    this.host = host;
    this.port = port;
    this.debug= debug;
    this.mailbox = mailbox; // mailbox to monitor
  }

}
