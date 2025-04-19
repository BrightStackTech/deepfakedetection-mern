const express = require('express');
const passport = require('passport');
const User = require('../Models/user'); // need to require the User model
const { updateUserProfile, checkUsername, addMediaUrl, getUserMedia, deleteMedia } = require('../Controllers/userController');
const router = express.Router();

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

// User details and profile management
router.get('/getUserDetails', (req, res) => {
  console.log("GET User Details - Auth Status:", req.isAuthenticated(), req.user ? req.user._id : null);
  if (req.isAuthenticated()) {
    const { username, email, profilePicture } = req.user;
    res.json({ username, email, profilePicture });
  } else {
    res.status(401).json({ error: "User not authenticated" });
  }
});

// Media management routes
router.post('/addMediaUrl', passport.authenticate('session'), addMediaUrl);
router.get('/getMedia', passport.authenticate('session'), getUserMedia);
router.delete('/deleteMedia', deleteMedia);
router.put('/updateUserProfile', passport.authenticate('session'), updateUserProfile);
router.get('/checkUsername', checkUsername);

module.exports = router;
