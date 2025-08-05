var express = require('express');
var router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('./middlewareAuth/googleAuth')
const LocalStrategy = require('./middlewareAuth/localAuth')
// const LocalStrategy = require('passport-local');
const usermodel = require('./models/users');
const postmodel = require('./models/post');
const upload = require('./fileupload/multer');
const isloggedin = require('../middlewareAuth/isLoggedIn')


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

module.exports = router