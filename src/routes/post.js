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
    const user = await usermodel.findOne({ _id: req.user._id });
    const { title, description } = req.body;
    
    const post = await postmodel.create({
      title,
      description,
      image: req.file.filename, // Assuming multer saves filename
      user: user._id
    });
    
    user.posts.push(post._id);
    await user.save();
    
    res.redirect("/profile");
  } catch (error) {
    console.error("Error creating post:", error);
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

router.post("/createpost", isloggedin, upload.single("image"), async function (req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: 0,
          message: "no file is uploaded",
        });
      }

      if (!req.body.title || !req.body.description) {
        return res.status(400).json({
          status: 0,
          message: "Title and description are required",
        });
      }

      const user = await usermodel.findOne({
        _id: req.user._id,
      });

      if (!user) {
        return res.status(404).json({
          status: 0,
          message: "User not found",
        });
      }

      const post = await postmodel.create({
        image: req.file.filename,
        description: req.body.description,
        title: req.body.title,
        user: user._id,
      });

      user.posts.push(post._id);
      await user.save();

      console.log("Post created successfully:", post);

      return res.redirect("/profile");
    } catch (error) {
      return res.status(500).json({
        status: 0,
        message: error.message || "Something went wrong while creating post",
      });
    }
  }
);

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

module.exports = router;