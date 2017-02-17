/**
 * Broadcast updates to client when the model changes
 */

'use strict';

import EmailSettingEvents from './email-setting.events';

// Model events to emit
var events = ['save', 'remove'];

var generalEvent = "emailSetting:general";

export function register(socket) {
  // Bind model events to socket events
  for (var i = 0, eventsLength = events.length; i < eventsLength; i++) {
    var event = events[i];
    var listener = createListener(`emailSetting:${event}`, socket);

    EmailSettingEvents.on(event, listener);
    socket.on('disconnect', removeListener(event, listener));
  }

  var testListener = function (doc) {
      console.log("send a socket notification");
      socket.emit(generalEvent, doc);
  };
  EmailSettingEvents.on(generalEvent, testListener);
  socket.on('disconnect', removeListener(generalEvent, testListener));
}


function createListener(event, socket) {
  return function (doc) {
    socket.emit(event, doc);
  };
}

function removeListener(event, listener) {
  return function () {
    EmailSettingEvents.removeListener(event, listener);
  };
}
