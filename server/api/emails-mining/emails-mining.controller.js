/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/emails-minings              ->  index
 * POST    /api/emails-minings              ->  create
 * GET     /api/emails-minings/:id          ->  show
 * PUT     /api/emails-minings/:id          ->  upsert
 * PATCH   /api/emails-minings/:id          ->  patch
 * DELETE  /api/emails-minings/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
const util = require('util');
import EmailsMining from './emails-mining.model';
import MailListener from '../../components/imap';


var mailListenerInbox;
var mailListenerSent;

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

// Gets a list of EmailsMinings
export function index(req, res) {
  return EmailsMining.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single EmailsMining from the DB
export function show(req, res) {
  return EmailsMining.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new EmailsMining in the DB
export function create(req, res) {
  return EmailsMining.create(parsedEmail)
      .then(respondWithResult(res, 201))
      .catch(handleError(res));
}

// Upserts the given EmailsMining in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return EmailsMining.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing EmailsMining in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return EmailsMining.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a EmailsMining from the DB
export function destroy(req, res) {
  return EmailsMining.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

var saveEmail = function(email) {
  return EmailsMining.findOneAndUpdate({messageId: email.messageId}, email,
    {new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()
    .then(function() {
      console.log("email has been saved");
    })
    .catch(function() {
      console.log("saving failed");
    });
};
export function start(req, res) {

  mailListenerInbox = MailListener.createListener("jinbo.chen@gmail.com", "chunfeng2", "imap.gmail.com", 993, "Inbox", ["UNSEEN"]);
  MailListener.startListener(mailListenerInbox, true, function (email) {
    console.log("received email=", email.subject);
    saveEmail(email);
  }).then(function() {
    console.log("started listener");
  });
  return res.status(200).send('triggered email monitoring');

}

export function stop(req, res) {
  MailListener.stopListener(mailListenerInbox);
  return res.status(200).send('triggered stopping email monitoring');
}


