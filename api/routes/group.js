'use strict'

const { Router } = require('express');
const groupAdminController = require('./../controllers/groupAdmin');
const mongoCollections = require('./../../lib/MongoCollections')
const router = new Router();


router.post('/stats', groupAdminController.getGroupStats);
router.post('/messages', groupAdminController.getGroupMessages);
router.post('/members', groupAdminController.getGroupMembers);
router.post('/messages-yearly-count', groupAdminController.getGroupMessagesYearlyCount);
router.post('/messages-monthly-count', groupAdminController.getGroupMessagesMonthlyCount);

module.exports = router;