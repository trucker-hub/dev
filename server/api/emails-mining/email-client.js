/**
 * Created by jinbochen on 1/30/17.
 */
'use strict';

const mailListener = require('../../components/imap');

mailListener.start(function (email) {
    console.log("from", email.from);
    console.log("to", email.to);
    console.log("subject", email.subject);
});