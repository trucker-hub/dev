/**
 * Created by jinbochen on 1/30/17.
 */
'use strict';

const util = require('util');
const listener = require('../../components/imap');

//listener.init("jinbo.chen@gmail.com", "chunfeng2", "imap.gmail.com", 993, "Inbox");
listener.init("lan@cc-chb.com", "edcrfv9111", "imap.secureserver.net", 993, "Inbox");
listener.start(function (email) {
    console.log("from", email.from);
    console.log("to", email.to);
    console.log("subject", email.subject);
    console.log(util.inspect(email, {depth: null, colors: true}));
});