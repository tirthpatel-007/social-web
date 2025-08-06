var express = require("express");
var router = express.Router();
const usermodel = require("../models/users").model;
const postmodel = require("../models/post");
const isloggedin = require("../middlewares/isLoggedIn");
const upload = require("../middlewares/multer");

// GET routes for posts
router.get("/addpost", isloggedin, function (req, res) {
  res.render("post", { nav: true });
});

router.get("/allpost", isloggedin, async function (req, res, next) {
  try {
    const user = await usermodel
      .findOne({
        _id: req.user._id,
      })
      .populate("posts");
    res.render("allpost", { user, nav: true });
  } catch (error) {
    next(error);
  }
});

// POST routes for posts
router.post("/createpost", isloggedin, upload.single("file"), async function (req, res) {
  try {
    // Check if file was uploaded
    if (!req.file) {
      console.log("No file uploaded");
      return res.redirect("/addpost");
    }

    const user = await usermodel.findOne({ _id: req.user._id });
    const { title, description } = req.body;
    
    const post = await postmodel.create({
      title,
      description,
      image: req.file.path, // Cloudinary returns the full URL in req.file.path
      user: user._id
    });
    
    user.posts.push(post._id);
    await user.save();
    
    console.log("Post created successfully with Cloudinary URL:", req.file.path);
    res.redirect("/profile");
  } catch (error) {
    console.error("Error creating post:", error);
    console.error("Request body:", req.body);
    console.error("Request file:", req.file);
    res.redirect("/addpost");
  }
});

router.post("/deletepost/:id", isloggedin, async function (req, res) {
  try {
    const postId = req.params.id;
    const user = await usermodel.findOne({ _id: req.user._id });
    
    // Remove post from user's posts array
    user.posts.pull(postId);
    await user.save();
    
    // Delete the post
    await postmodel.findByIdAndDelete(postId);
    
    res.redirect("/profile");
  } catch (error) {
    console.error("Error deleting post:", error);
    res.redirect("/profile");
  }
});

module.exports = router;