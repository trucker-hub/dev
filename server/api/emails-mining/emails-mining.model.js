'use strict';

import mongoose from 'mongoose';

var addressSchema = {
  address: String,
  name: String
};

var EmailsMiningSchema = new mongoose.Schema({
  from: [ addressSchema ],
  subject: String,
  headers : [ {key: String, value: String} ],
  to: [ addressSchema ],
  cc: [ addressSchema ],
  bcc:[ addressSchema ],
  date: Date,
  receivedDate: Date,
  messageId: String,
  inReplyTo: [String],
  replyTo: String,
  references: [String],
  priority: { type: String, enum: [ 'high', 'normal', 'low' ], default: 'normal'},
  text: String,
  html: String,
  attachments: [ { name: String, type:String, size: Number} ],
  active: Boolean
});

export default mongoose.model('Email', EmailsMiningSchema);