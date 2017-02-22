'use strict';

var express = require('express');
var controller = require('./email-setting.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.upsert);
router.patch('/:id', controller.patch);
router.delete('/:id', controller.destroy);
router.post('/start', controller.startMonitoring);
router.post('/stop', controller.stopMonitoring);
router.post('/status', controller.status);

module.exports = router;
