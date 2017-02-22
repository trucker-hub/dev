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
import Email from '../email/email.model';
import MailClient from '../../components/imap/imap-client';

var clients = new Map();

let MSG_TYPE = "monitoring";
let MSG_EVENT = "emailSetting:general";

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
      client.connected = false;
      clients.delete(email.username);
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

var saveEmail = function (email) {
  try {
    Email.findOneAndUpdate({messageId: email.messageId + ""}, email,
      {new: true, upsert: true, setDefaultsOnInsert: true, runValidators: false}).exec()
      .then(function () {
        console.log("email has been saved");
      });
  } catch (e) {
    print(e);
  }
};



function monitor(account, startMonitoring, res) {

  var client = clients.get(account.username);

  console.log("IMAP client status:" + account.username, account.monitoring);
  if (client && client.connected) {
    if (startMonitoring) {
      return res.status(200).json(event("running", account));
    } else {
      client.imap.destroy();
      clients.delete(account.username);
      client.connected = false;
      return res.status(200).json(event("stopped", account));
    }
  } else if (client && !client.connected) {
    if (startMonitoring) {
      client.start();
      return res.status(200).json(event("pending", account));
    } else {
      return res.status(200).json(event("running", account));
    }
  } else {

    client = new MailClient({
        username: account.username,
        password: account.password,
        host: account.host,
        port: account.port, // imap port
        mailbox: account.mailbox, // mailbox to monitor
        searchFilter: ['UNSEEN'],
        options: {
          tls: account.tls,
          tlsOptions: {rejectUnauthorized: false},
          debug: account.debugging,
          connTimeout: 10000, // Default by node-imap
          authTimeout: 5000, // Default by node-imap,
          keepConnected: false
        }
      },
      function (email) {
        saveEmail(email);
      },
      function (email) {
        saveEmail(email);
      },
      function (email) {
        saveEmail(email);
      }
    );

    clients.set(account.username, client);
    client.on("server:connected", function () {
      //connection is good
      account.monitoring.status='running';
      privateUpdate(account);
      EmailSettingEvents.emit(MSG_EVENT, event("running", account));
    });
    client.on("error", function (err) {
      console.error("err", err);
      if(startMonitoring) {
        account.monitoring.status='failed';
        privateUpdate(account);
        EmailSettingEvents.emit(MSG_EVENT, event("failed", account));
      }else {
        account.monitoring.status='stopped';
        privateUpdate(account);
        EmailSettingEvents.emit(MSG_EVENT, event("stopped", account));
      }
    });

    client.start();
    return res.status(200).json(event("pending", account));
  }
}

function syncStatus(account) {
  var client = clients.get(account.username);
  if(client) {
    if(client.connected) {
      account.monitoiring = {'status': 'running'};
    }else {
      account.monitoring = {'status': 'stopped'};
    }
  }else {
    account.monitoiring = {"status": ''};
  }
  privateUpdate(account);
}

export function status(req, res) {

  var accounts = req.body;
  for(var i=0; i < accounts.length; ++i) {
    syncStatus(accounts[i]);
  }
  return res.status(200).json(accounts);
}
export function startMonitoring(req, res) {
  var account = req.body;
  monitor(account, true, res);
}

export function stopMonitoring(req, res) {
  var account = req.body;
  monitor(account, false, res);
}
