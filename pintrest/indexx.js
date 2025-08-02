var express = require('express');
var router = express.Router();
const passport = require('passport')
const LocalStrategy = require('passport-local')
const usermodel = require('./users')
const postmodel = require('./post')
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// passport local custom auth
passport.use(new LocalStrategy({
  usernameField: 'email',  // Tell passport to use 'email' field instead of 'username'
  passwordField: 'password'
}
,async (email, password, done)=>{
  try{

    const user = await usermodel.findOne({ email: email });
     
  user.authenticate(password, (err, result) => {
    if (err) return done(err);
    if (result) return done(null, user);
    return done(null, false);
  });
  }
  catch(error){
    return done(error)
  }
}
));
// passport.use(new LocalStrategy(usermodel.authenticate()));
const upload = require('./multer')

// isuser login
function isloggedin(req,res,next){
  if(req.isAuthenticated()){
    return next()
  }
  res.redirect('/')
}


/* GET home page. */
router.get('/', function(req, res) {
  res.render('register',{nav: false});
});
router.get('/login', function(req, res) {
  res.render('login',{nav: false});
}); 
router.get('/addpost', isloggedin, function(req, res) {
  res.render('post',{nav: true});
}); 

router.get('/allpost' ,isloggedin, async function(req, res, next) {
  const user = await usermodel.findOne({
    username: req.session.passport.user
  })
  .populate('post');
  res.render('allpost',{user, nav: true});
}); 
router.get('/feed' ,isloggedin, async function(req, res, next) {
  const user = await usermodel.findOne({
    username: req.session.passport.user
  })
  const post = await postmodel.find().limit(6)
  .populate('user');
  console.log(user)
  res.render('feed',{user, post, nav: true});
}); 
router.get("/logout", function (req, res, next) { 
  req.logout(function (err) { 
    if (err) {  
      return next(err);  
    }
    res.redirect("/login"); 
  }); 
}); 

router.get('/profile', isloggedin, async function(req, res) {
  const user = await usermodel.findOne({
    username: req.session.passport.user
  })
  .populate('post');
  res.render('profile', {user, nav: true});
});

// ****************** post Apis **************** // 

router.post('/register',  function (req, res) {
  const { username, email, password, contact } = req.body;

  const users =  new usermodel({
    username: username,
    email: email,
    contact: contact,
  });

  usermodel.register(users, password, (err, user) => {
    if (err) {
      return res.redirect("/");
    }

    passport.authenticate('local')(req, res, () => {
      return res.redirect("/profile");
      
      });
    });
  });
  
router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/login'
  // failureFlash: true
}), function(req,res){})

router.post('/fileupload', isloggedin, upload.single('image'), async(req, res) => {
    try {
    
        if (!req.file) {
            return res.status(400).json({ 
                status: 0, 
                message: 'No file uploaded' 
            });
        }

        const user = await usermodel.findOne({
            username: req.session.passport.user
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
      username: req.session.passport.user
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

    // res.status(200).json({
    //   status: 1,
    //   message: "Post created successfully",
    //   post: {
    //     id: post._id,
    //     title: post.title,
    //     description: post.description,
    //     image: post.image
    //   }
    // });
    
   return res.redirect('/profile')
  } catch(error) {
    // console.error('Error creating post:', error);
    
  return  res.status(500).json({
      status: 0,
      message: error.message || "Something went wrong while creating post"
    });
  }
});
module.exports = router;
