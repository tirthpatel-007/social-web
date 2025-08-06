require("dotenv").config();
var express = require("express");
var router = express.Router();
const passport = require("passport");
const GoogleStrategy = require("../middlewares/googleAuth");
const LocalStrategy = require('../middlewares/localAuth').Strategy;
const usermodel = require("../models/users").model;

// GET routes for auth
router.get("/login", function (req, res) {
  res.render("login", { nav: false });
});

// Google Auth Routes
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/profile");
  }
);

// GET logout
router.get("/logout", function(req, res, next) {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

// POST routes for auth
router.post("/register", function (req, res) {
  const { username, email, password, contact } = req.body;

  const users = new usermodel({
    username: username,
    email: email,
    contact: contact,
  });

  usermodel.register(users, password, (err, user) => {
    if (err) {
      console.error("Error during local registration:", err);
      return res.redirect("/"); 
    }

    passport.authenticate("local")(req, res, () => {
      return res.redirect("/profile");
    });
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (req, res) {}
);

module.exports = router;