require("dotenv").config();
var express = require("express");
var router = express.Router();
const usermodel = require("../models/users").model;
const postmodel = require("../models/post");
const isloggedin = require("../middlewares/isLoggedIn");

// Main GET routes only
router.get("/", function (req, res) {
  res.render("register", { nav: false });
});

router.get("/feed", isloggedin, async function (req, res, next) {
  try {
    const user = await usermodel.findOne({
      _id: req.user._id,
    });
    const post = await postmodel.find().limit(6).populate("user");
    res.render("feed", { user, post, nav: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;