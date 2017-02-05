'use strict';

var express = require('express');
var controller = require('./email.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.upsert);
router.patch('/:id', controller.patch);
router.delete('/:id', controller.destroy);
router.post('/startMonitoring', controller.start);
router.post('/stopMonitoring', controller.stop);
router.get('/isMonitoring', controller.monitoringStatus);

module.exports = router;