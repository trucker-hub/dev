/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/email-settings              ->  index
 * POST    /api/email-settings              ->  create
 * GET     /api/email-settings/:id          ->  show
 * PUT     /api/email-settings/:id          ->  upsert
 * PATCH   /api/email-settings/:id          ->  patch
 * DELETE  /api/email-settings/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import EmailSetting from './email-setting.model';
import EmailSettingEvents from './email-setting.events';

import MailClient from '../../components/imap/imap-client';
var clients = new Map();

let MSG_TYPE = "monitoring";

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function (entity) {
    try {
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch (err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function (entity) {
    if (entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of EmailSettings
export function index(req, res) {
  return EmailSetting.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single EmailSetting from the DB
export function show(req, res) {
  return EmailSetting.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new EmailSetting in the DB
export function create(req, res) {
  return EmailSetting.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given EmailSetting in the DB at the specified ID
export function upsert(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return EmailSetting.findOneAndUpdate({_id: req.params.id}, req.body, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
    runValidators: true
  }).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing EmailSetting in the DB
export function patch(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return EmailSetting.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a EmailSetting from the DB
export function destroy(req, res) {

  return EmailSetting.findById(req.params.id).exec(function(err, entity) {
    if(err) console.error("error", err);
    console.log("about to delte this account", entity);
    //let's stop the client first
    var client = clients.get(entity.username);
    if(client && client.connected) {
      client.imap.destroy();
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

function privateUpdate(account) {
  return EmailSetting.findOneAndUpdate({_id: account._id}, account, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
    runValidators: true
  }).exec()

    .then(function() {
      console.log("private update is good");
    })
    .catch(function() {
      console.log("private update failed");
    });
}

function event(status, email) {
  return {"status": status, type: MSG_TYPE, username: email.username};
}
function monitor(email, starting, res) {

  var client = clients.get(email.username);

  if (client && client.connected) {
    if (starting) {
      return res.status(200).json();
    } else {
      client.imap.destroy();
      return res.status(200).json(event("stopped", email));
    }
  } else if (client && !client.connected) {
    if (starting) {
      client.start();
      return res.status(200).json(event("pending", email));
    } else {
      return res.status(200).json(event("running", email));
    }
  } else {

    client = new MailClient({
        username: email.username,
        password: email.password,
        host: email.host,
        port: email.port, // imap port
        mailbox: email.mailbox, // mailbox to monitor
        searchFilter: ['UNSEEN'],
        options: {
          tls: email.tls,
          tlsOptions: {rejectUnauthorized: false},
          debug: email.debugging,
          connTimeout: 10000, // Default by node-imap
          authTimeout: 5000, // Default by node-imap,
          keepConnected: false
        }
      },
      function (email) {
        console.log("new email received");
      },
      function (email) {
        console.log("email updated");
      },
      function (email) {
        console.log("email deleted");
      }
    );
    clients.set(email.username, client);
    client.on("server:connected", function () {
      //connection is good
      email.monitoring.status='running';
      privateUpdate(email);
      EmailSettingEvents.emit("emailSetting:general", event("running", email));
    });
    client.on("error", function (err) {
      console.error("err", err);
      if(starting) {
        email.monitoring.status='failed';
        privateUpdate(email);
        EmailSettingEvents.emit("emailSetting:general", event("failed", email));
      }else {
        email.monitoring.status='stopped';
        privateUpdate(email);
        EmailSettingEvents.emit("emailSetting:general", event("stopped", email));
      }

    });

    client.start();

    return res.status(200).json(event("pending", email));
  }
}

export function startMonitoring(req, res) {
  var account = req.body;
  monitor(account, true, res);
}

export function stopMonitoring(req, res) {
  var account = req.body;
  monitor(account, false, res);
}
