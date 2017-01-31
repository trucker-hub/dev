'use strict';

var express = require('express');
var controller = require('./emails-mining.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.upsert);
router.patch('/:id', controller.patch);
router.delete('/:id', controller.destroy);
router.post('/start-monitoring', controller.start);
router.post('/stop-monitoring', controller.stop);

module.exports = router;
