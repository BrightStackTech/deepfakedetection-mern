const express = require('express');
const router = express.Router();
const { register, login, confirmEmail } = require('../Controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/confirmation/:token', confirmEmail);

module.exports = router;