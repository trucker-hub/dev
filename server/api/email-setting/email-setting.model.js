'use strict';

import mongoose from 'mongoose';

var EmailSettingSchema = new mongoose.Schema({
  name: String,
  info: String,
  active: Boolean
});

export default mongoose.model('EmailSetting', EmailSettingSchema);
