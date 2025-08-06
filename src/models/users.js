const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const localStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose'); // This line is now added

// Your user schema and model definition
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    
  },
  password: {
    type: String,
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  dp: {
    type: String, 
  },
  googleId:{
    type: String,
    sparse: true
  },
  email: {
    type: String,
    required: true,
    
  },
  contact:{
    type: Number
  },
  profilePicture: {
    type: String
  },
  fullname: {
    type: String,
  },
});

userSchema.plugin(passportLocalMongoose);

const userModel = mongoose.model("user", userSchema);


passport.use(new localStrategy(userModel.authenticate()));


module.exports = {
  router: router,
  model: userModel,
  serializeUser: userModel.serializeUser(),
  deserializeUser: userModel.deserializeUser()
};