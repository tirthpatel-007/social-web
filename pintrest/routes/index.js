require('dotenv').config();
var express = require('express');
var router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('./middlewareAuth/googleAuth')
const LocalStrategy = require('./middlewareAuth/localAuth')
// const LocalStrategy = require('passport-local');
const usermodel = require('./models/users').model;
const postmodel = require('./models/post');

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


// Inside routes/index.js
const upload = require('./fileupload/multer');

// isuser login
function isloggedin(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

/* home page. */
router.get('/', function(req, res) {
    res.render('register', { nav: false });
});

router.get('/login', function(req, res) {
    res.render('login', { nav: false });
});

router.get('/addpost', isloggedin, function(req, res) {
    res.render('post', { nav: true });
});

router.get('/allpost', isloggedin, async function(req, res, next) {
    const user = await usermodel.findOne({
        _id: req.user._id 
    }).populate('posts');
    res.render('allpost', { user, nav: true });
});

router.get('/feed', isloggedin, async function(req, res, next) {
    const user = await usermodel.findOne({
        _id: req.user._id 
    });
    const post = await postmodel
    .find()
    .limit(6)
    .populate('user');
    console.log(user);
    res.render('feed', { user, post, nav: true });
});

router.get("/logout", function(req, res, next) {
    req.logout(function(err) {
        if (err) {
            return next(err);
        }
        res.redirect("/login");
    });
});

router.get('/profile', isloggedin, async function(req, res) {
    const user = await usermodel.findOne({
        _id: req.user._id 
    }).populate('posts');
    res.render('profile', { user, nav: true });
});

// this is google auth 
router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));
 
router.get('/auth/google/callback',
    passport.authenticate('google',
      { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/profile');
    });

// ****************** post apis **************** //

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



module.exports = router;