'use strict';

import mongoose from 'mongoose';

var EmailsMiningSchema = new mongoose.Schema({
  active: Boolean
});

export default mongoose.model('EmailMining', EmailsMiningSchema);
