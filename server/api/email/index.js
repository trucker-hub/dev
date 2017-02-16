'use strict';

var express = require('express');
var controller = require('./email.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.get('/monitoring/status', controller.status);
router.post('/', controller.create);
router.put('/:id', controller.upsert);
router.patch('/:id', controller.patch);
router.delete('/:id', controller.destroy);
router.post('/monitoring/start', controller.start);
router.post('/monitoring/test', controller.test);
router.post('/monitoring/stop', controller.stop);

module.exports = router;
