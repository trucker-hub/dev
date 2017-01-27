/**
 * EmailsMining model events
 */

'use strict';

import {EventEmitter} from 'events';
import EmailsMining from './emails-mining.model';
var EmailsMiningEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
EmailsMiningEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
for(var e in events) {
  let event = events[e];
  EmailsMining.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    EmailsMiningEvents.emit(event + ':' + doc._id, doc);
    EmailsMiningEvents.emit(event, doc);
  };
}

export default EmailsMiningEvents;
