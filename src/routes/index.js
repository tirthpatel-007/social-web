require("dotenv").config();
var express = require("express");
var router = express.Router();
const passport = require("passport");
const GoogleStrategy = require("../middlewares/googleAuth");
// const LocalStrategy = require('./middlewares/localAuth').Strategy
// const LocalStrategy = require('passport-local');
const usermodel = require("../models/users").model;
const postmodel = require("../models/post");
const isloggedin = require("../middlewares/isLoggedIn");
const createpost = require("./pintrest/createpost");

//  get routes
router.get("/", function (req, res) {
  res.render("register", { nav: false });
});

router.get("/login", function (req, res) {
  res.render("login", { nav: false });
});

router.get("/addpost", isloggedin, function (req, res) {
  res.render("post", { nav: true });
});

router.get("/allpost", isloggedin, async function (req, res, next) {
  const user = await usermodel
    .findOne({
      _id: req.user._id,
    })
    .populate("posts");
  res.render("allpost", { user, nav: true });
});

router.get("/feed", isloggedin, async function (req, res, next) {
  const user = await usermodel.findOne({
    _id: req.user._id,
  });
  const post = await postmodel.find().limit(6).populate("user");
  console.log(user);
  res.render("feed", { user, post, nav: true });
});

router.get("/profile", isloggedin, async function (req, res) {
  const user = await usermodel
    .findOne({
      _id: req.user._id,
    })
    .populate("posts");
  res.render("profile", { user, nav: true });
});

// this is google auth
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

module.exports = router;
