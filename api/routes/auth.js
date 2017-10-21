'use strict'

const { Router } = require('express');
const authController = require('./../controllers/auth')
const router = new Router();

router.post('/login', authController.login);
router.post('/sendCode', authController.sendCode);
router.post('/sendcall', authController.sendCall);
router.post('/signup', authController.signup);

module.exports = router;