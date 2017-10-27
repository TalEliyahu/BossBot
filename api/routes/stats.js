'use strict'

const { Router } = require('express')
const StatsController = require('./../controllers/stats')
const router = new Router()

router.post('/bot-activity', StatsController.botActivity)
router.post('/active-users', StatsController.activeUsers)
router.post('/active-admins', StatsController.activeAdmins)
router.post('/deleted-messages', StatsController.deletedMessages)

module.exports = router;