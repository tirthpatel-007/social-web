var express = require('express');
var router = express.Router();
const passport = require('passport');
const usermodel = require('./models/users');
const postmodel = require('./models/post');
const upload = require('./fileupload/multer');
const isloggedin = require('../middlewareAuth/isLoggedIn')

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
            _id: req.user._id 
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
module.exports = router