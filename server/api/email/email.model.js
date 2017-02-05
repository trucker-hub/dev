'use strict';

import mongoose from 'mongoose';

var attachmentType = new mongoose.Schema({ name: String, type:String, size: Number});
var addressSchema = new mongoose.Schema({ address: String, name: String });

var EmailSchema = new mongoose.Schema({
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
  attachments: [ attachmentType ],
  active: Boolean
});

export default mongoose.model('Email', EmailSchema);
