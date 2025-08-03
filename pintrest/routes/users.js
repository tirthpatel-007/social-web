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
    unique: true,
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
  email: {
    type: String,
    required: true,
    unique: true,
  },
  fullname: {
    type: String,
    required: true,
  },
});

userSchema.plugin(passportLocalMongoose);

const userModel = mongoose.model("user", userSchema);

// This tells Passport to use the userModel for its local strategy
passport.use(new localStrategy(userModel.authenticate()));

// Export everything needed
module.exports = {
  router: router,
  model: userModel,
  serializeUser: userModel.serializeUser(),
  deserializeUser: userModel.deserializeUser()
};