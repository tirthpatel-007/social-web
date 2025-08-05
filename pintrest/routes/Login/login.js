var express = require('express');
const router = express.Router()
const passport = require('passport')


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

module.exports = router