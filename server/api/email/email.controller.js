/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/emails              ->  index
 * POST    /api/emails              ->  create
 * GET     /api/emails/:id          ->  show
 * PUT     /api/emails/:id          ->  upsert
 * PATCH   /api/emails/:id          ->  patch
 * DELETE  /api/emails/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Email from './email.model';
import MailClient from '../../components/imap/imap-client';

var client;


function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Emails
export function index(req, res) {
  return Email.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Email from the DB
export function show(req, res) {
  return Email.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Email in the DB
export function create(req, res) {
  return Email.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Email in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Email.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Email in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Email.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Email from the DB
export function destroy(req, res) {
  return Email.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

var saveEmail = function(email) {
  try {
    Email.findOneAndUpdate({messageId: email.messageId + ""}, email,
      {new: true, upsert: true, setDefaultsOnInsert: true, runValidators: false}).exec()
      .then(function() {
        console.log("email has been saved");
      });
  } catch(e) {
    print(e);
  }
};

export function status (req, res) {

  //console.log("listener status", mailListenerInbox.imap.state);
  if(client && client.connected) {
    return res.status(200).send("STARTED");
  }else {
    return res.status(200).send("STOPPED");
  }
}

export function start(req, res) {

  //mailListenerInbox = MailListener.createListener("jinbo.chen@gmail.com", "chunfeng2", "imap.gmail.com", 993, "Inbox", ["UNSEEN"]);
  client = new MailClient({
    username: "jinbo.chen@gmail.com",
    password: "chunfeng2",
    host: "imap.gmail.com",
    port: 993, // imap port
    mailbox: "Inbox", // mailbox to monitor
    searchFilter: ['UNSEEN'],
    options: {
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
      debug: true,
      connTimeout: 10000, // Default by node-imap
      authTimeout: 5000, // Default by node-imap,
      keepConnected: false
    }},
    function(email) {
      saveEmail(email);
    },
    function(email) {
      saveEmail(email);
    },
    function(email) {
      saveEmail(email);
    }
  );

  client.start();
  return res.status(200).send("STARTED");

}

export function stop(req, res) {
  client.stop();
  return res.status(200).send("STOPPED");
}



