require('dotenv').config(); 
var express = require('express');
var router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const usermodel = require('./users').model;
const postmodel = require('./post');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
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

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    scope: ['profile', 'email']
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      // 1. Try to find a user with the matching Google ID
      let user = await usermodel.findOne({ googleId: profile.id });

      // If user with Google ID exists, log them in
      if (user) {
        return done(null, user);
      }

      // 2. If no user with Google ID, check if a user with that email exists
      user = await usermodel.findOne({ email: profile.emails[0].value });

      // If user with that email exists, link their Google ID and log them in
      if (user) {
        user.googleId = profile.id; // Link the account
        await user.save();
        return done(null, user);
      } 
      
      // 3. If no user exists with that Google ID or email, create a new one
      else {
        // We still check for username collisions just in case
        let potentialUsername = profile.displayName.replace(/\s/g, '').toLowerCase();
        let existingUser = await usermodel.findOne({ username: potentialUsername });
        if (existingUser) {
            potentialUsername += Math.floor(Math.random() * 10000);
        }

        const newUser = new usermodel({
            googleId: profile.id,
            username: potentialUsername,
            email: profile.emails[0].value,
            fullname: profile.displayName,
            profilePicture: profile.photos[0].value
        });

        await newUser.save();
        return done(null, newUser);
      }
    } catch (error) {
      return done(error, null);
    }
  }
));

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

router.post('/fileupload', isloggedin, upload.single('image'), async(req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 0,
                message: 'No file uploaded'
            });
        }

        const user = await usermodel.findOne({
            _id: req.user._id
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

        user.posts.push(post._id);
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