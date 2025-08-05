var express = require('express');
var router = express.Router();
const passport = require('passport');
const usermodel = require('./models/users');
const postmodel = require('./models/post');
const isloggedin = require('../middlewareAuth/isLoggedIn')

router.delete('/delete/post/:id', isloggedin, async function(req,res){
    try{
       const deletepost= await postmodel.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        })
        res.status(200).json({
            status: 1,
            message: 'deleted',
            post: deletepost
        })
    }
    catch(error){
        res.status(200).json({
            status: 0,
            message: 'failed to delete the post',
            err: error.message,
            post:[]
        })
    }
})

module.exports = router