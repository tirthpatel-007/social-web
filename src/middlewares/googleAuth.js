const express = require("express");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const mongoose = require("mongoose");
var router = express.Router();
const usermodel = require("../models/users").model;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      scope: ["profile", "email"],
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
      
        let user = await usermodel.findOne({ googleId: profile.id });

   
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
          let potentialUsername = profile.displayName
            .replace(/\s/g, "")
            .toLowerCase();
          let existingUser = await usermodel.findOne({
            username: potentialUsername,
          });
          if (existingUser) {
            potentialUsername += Math.floor(Math.random() * 10000);
          }

          const newUser = new usermodel({
            googleId: profile.id,
            username: potentialUsername,
            email: profile.emails[0].value,
            fullname: profile.displayName,
            profilePicture: profile.photos[0].value,
          });

          await newUser.save();
          return done(null, newUser);
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize and deserialize user for session management
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  try {
    const user = await usermodel.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
