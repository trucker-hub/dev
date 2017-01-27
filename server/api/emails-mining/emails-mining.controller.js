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
import EmailsMining from './emails-mining.model';
import MailListener from 'mail-listener2';

var mailListener = new MailListener({
  username: "jinbo.chen@gmail.com",
  password: "chunfeng2",
  host: "imap.gmail.com",
  port: 993, // imap port
  tls: true,
  connTimeout: 10000, // Default by node-imap
  authTimeout: 5000, // Default by node-imap,
  debug: console.log, // Or your custom function with only one incoming argument. Default: null
  tlsOptions: { rejectUnauthorized: false },
  mailbox: "Inbox", // mailbox to monitor
  searchFilter: ["UNSEEN"], // the search filter being used after an IDLE notification has been retrieved
  markSeen: false, // all fetched email willbe marked as seen and not fetched next time
  fetchUnreadOnStart: false, // use it only if you want to get all unread email on lib start. Default is `false`,
  mailParserOptions: {streamAttachments: true}, // options to be passed to mailParser lib.
  attachments: false, // download attachments as they are encountered to the project directory
  attachmentOptions: { directory: "attachments/" } // specify a download directory for attachments
});

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
  return EmailsMining.create(req.body)
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

mailListener.start(); // start listening

// stop listening
//mailListener.stop();

mailListener.on("server:connected", function(){
  console.log("imapConnected");
});

mailListener.on("server:disconnected", function(){
  console.log("imapDisconnected");
});

mailListener.on("error", function(err){
  console.log(err);
});

mailListener.on("mail", function(mail, seqno, attributes){
  // do something with mail object including attachments
  console.log("mail received!");
  console.log("emailParsed", mail);
  // mail processing code goes here
});

mailListener.on("attachment", function(attachment){
  console.log("attachment received!");
  console.log(attachment.path);
});
