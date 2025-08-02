var express = require('express');
var router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const usermodel = require('./users');
const postmodel = require('./post');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Load environment variables (for CLIENT_ID and CLIENT_SECRET)
require('dotenv').config(); // Make sure you install dotenv: npm install dotenv

// --- Passport Local Custom Auth ---
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

// --- Passport Google OAuth 2.0 Strategy ---
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID, // Use environment variables for security
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Use environment variables for security
    callbackURL: "http://localhost:3000/auth/google/callback" // This must match your Authorized redirect URI
},
async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await usermodel.findOne({ googleId: profile.id });

        if (user) {
            // User already exists, log them in
            return done(null, user);
        } else {
            // User does not exist, create a new user account
            user = new usermodel({
                googleId: profile.id,
                username: profile.displayName || profile.emails[0].value.split('@')[0], // Use display name or derive from email
                email: profile.emails[0].value,
                profilePicture: profile.photos[0].value // Store Google profile picture URL
            });
            await user.save();
            return done(null, user);
        }
    } catch (err) {
        return done(err, null);
    }
}));

// Serialize and deserialize user for session management
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
    try {
        const user = await usermodel.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

const upload = require('./multer');

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
        _id: req.user._id // Use req.user._id after deserializeUser
    }).populate('post');
    res.render('allpost', { user, nav: true });
});

router.get('/feed', isloggedin, async function(req, res, next) {
    const user = await usermodel.findOne({
        _id: req.user._id // Use req.user._id after deserializeUser
    });
    const post = await postmodel.find().limit(6).populate('user');
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
        _id: req.user._id // Use req.user._id after deserializeUser
    }).populate('post');
    res.render('profile', { user, nav: true });
});

// --- google auths stretegy  ---
// google registration route
router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

    // google login  route
router.get('/auth/google/callback',
    passport.authenticate('google', 
      { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect to profile.
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

router.post('/fileupload', isloggedin, upload.single('image'), async(req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 0,
                message: 'No file uploaded'
            });
        }

        const user = await usermodel.findOne({
            _id: req.user._id // Use req.user._id
        });

        if (!user) {
            return res.status(404).json({
                status: 0,
                message: 'User not found'
            });
        }

        user.profilePicture = req.file.filename;
        await user.save();

        res.redirect('/profile');

    } catch (error) {
        res.status(500).json({
            status: 1,
            message: 'Upload failed',
            error: error.message
        });
    }
});

router.post('/createpost', isloggedin, upload.single('image'), async function(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 0,
                message: "no file is uploaded"
            });
        }

        if (!req.body.title || !req.body.description) {
            return res.status(400).json({
                status: 0,
                message: "Title and description are required"
            });
        }

        const user = await usermodel.findOne({
            _id: req.user._id // Use req.user._id
        });

        if (!user) {
            return res.status(404).json({
                status: 0,
                message: "User not found"
            });
        }

        const post = await postmodel.create({
            image: req.file.filename,
            description: req.body.description,
            title: req.body.title,
            user: user._id
        });

        user.post.push(post._id);
        await user.save();

        console.log('Post created successfully:', post);

        return res.redirect('/profile');
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message || "Something went wrong while creating post"
        });
    }
});

module.exports = router;