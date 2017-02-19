'use strict';

import mongoose from 'mongoose';

var EmailSettingSchema = new mongoose.Schema({
  username: String,
  password: String,
  host: String,
  port: Number,
  mailbox: String,
  search: String,
  tls: Boolean,
  debugging: Boolean,
  monitoring: { status: String }
});

export default mongoose.model('EmailSetting', EmailSettingSchema);
