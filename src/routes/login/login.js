var express = require('express');
const router = express.Router()
const passport = require('passport')
const LocalStrategy = require('passport-local');
const usermodel = require('../models/users');
const postmodel = require('../models/post');

router.get('/login', function(req, res) {
    res.render('login', { nav: false });
});

router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));
 
router.get('/auth/google/callback',
    passport.authenticate('google',
      { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/profile');
    });
    // this is passport local auth register api
router.post('/register', function(req, res) {
    const { username, email, password, contact } = req.body;

    const users = new usermodel({
        username: username,
        email: email,
        contact: contact,
    });

    usermodel.register(users, password, (err, user) => {
        if (err) {
            console.error("Error during local registration:", err);
            return res.redirect("/"); // Or render a registration error message
        }

        passport.authenticate('local')(req, res, () => {
            return res.redirect("/profile");
        });
    });
});
// this is passport local auth register api
router.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true // If you're using connect-flash, ensure this is enabled in your app.js
}), function(req, res) {});

module.exports = router