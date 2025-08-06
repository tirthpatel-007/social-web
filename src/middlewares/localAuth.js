var express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
},
async (email, password, done) => {
    try {
        const user = await usermodel.findOne({ email: email });
        if (!user) {
            return done(null, false, { message: 'Incorrect email.' });
        }
        user.authenticate(password, (err, result) => {
            if (err) return done(err);
            if (result) return done(null, user);
            return done(null, false, { message: 'Incorrect password.' });
        });
    } catch (error) {
        return done(error);
    }
}));

module.exports = passport