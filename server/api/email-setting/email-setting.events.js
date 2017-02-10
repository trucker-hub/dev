/**
 * EmailSetting model events
 */

'use strict';

import {EventEmitter} from 'events';
import EmailSetting from './email-setting.model';
var EmailSettingEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
EmailSettingEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
for(var e in events) {
  let event = events[e];
  EmailSetting.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    EmailSettingEvents.emit(event + ':' + doc._id, doc);
    EmailSettingEvents.emit(event, doc);
  };
}

export default EmailSettingEvents;
