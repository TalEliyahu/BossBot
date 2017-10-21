'use strict'

const { Router } = require('express');
const groupAdminController = require('./../controllers/groupAdmin');
const router = new Router();
const mongoCollections = require('./../../lib/MongoCollections')

router.post('/groups', groupAdminController.getGroups);        
router.post('/stats', groupAdminController.getDashboardStats);
router.post('/messages-yearly-count', groupAdminController.getMessagesYearlyCount);
router.post('/messages-monthly-count', groupAdminController.getMessagesMonthlyCount);

module.exports = router;