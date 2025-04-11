const express = require('express');
const passport = require('passport');
const User = require('../Models/user'); // need to require the User model
const { updateUserProfile, checkUsername } = require('../Controllers/userController');
const router = express.Router();
const { checkEmail } = require("../Controllers/authController");
const { requestPasswordReset, resetPassword } = require("../Controllers/authController");

// Custom middleware to manually populate req.user if not already set
router.use(async (req, res, next) => {
  if (!req.user && req.session && req.session.passport && req.session.passport.user) {
    try {
      const user = await User.findById(req.session.passport.user);
      req.user = user;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// ... existing routes below:
router.get('/getUserDetails', (req, res) => {
  if (req.isAuthenticated()) {
    const { username, email, profilePicture } = req.user;
    res.json({ username, email, profilePicture });
  } else {
    res.send(null);
  }
});

router.post('/addMediaUrl', passport.authenticate('session'), require('../Controllers/userController').addMediaUrl);
router.get('/getMedia', passport.authenticate('session'), require('../Controllers/userController').getUserMedia);
// Remove passport.authenticate('session') for DELETE to allow the custom middleware to work
router.delete('/deleteMedia', require('../Controllers/userController').deleteMedia);
router.put('/updateUserProfile', passport.authenticate('session'), updateUserProfile);
router.get('/checkUsername', checkUsername);
router.get("/checkEmail", checkEmail);
router.post("/requestPasswordReset", requestPasswordReset);
router.post("/resetPassword", resetPassword);


module.exports = router;