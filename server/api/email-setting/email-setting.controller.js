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
  console.log("should send out a socket notification");
  EmailSettingEvents.emit("emailSetting:general", req.body);
  if(req.body._id) {
    delete req.body._id;
  }
  return EmailSetting.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing EmailSetting in the DB
export function patch(req, res) {
  if(req.body._id) {
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
  return EmailSetting.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
