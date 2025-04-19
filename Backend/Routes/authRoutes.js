const express = require('express');
const router = express.Router();
const { register, login, confirmEmail, checkEmail, requestPasswordReset, resetPassword } = require('../Controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/confirmation/:token', confirmEmail);
router.get('/checkEmail', checkEmail);
router.post('/requestPasswordReset', requestPasswordReset);
router.post('/resetPassword', resetPassword);

module.exports = router;
