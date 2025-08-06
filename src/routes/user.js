var express = require("express");
var router = express.Router();
const usermodel = require("../models/users").model;
const isloggedin = require("../middlewares/isLoggedIn");
const upload = require("../middlewares/multer");


router.get("/profile", isloggedin, async function (req, res) {
  try {
    const user = await usermodel
      .findOne({
        _id: req.user._id,
      })
      .populate("posts");
    res.render("profile", { user, nav: true });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.redirect("/feed");
  }
});

router.post("/upload", isloggedin, upload.single("file"), async function (req, res) {
  try {
    const user = await usermodel.findOne({ _id: req.user._id });
    user.profileImage = req.file.filename;
    await user.save();
    res.redirect("/profile");
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.redirect("/profile");
  }
});

router.post('/fileupload', isloggedin, upload.single('image'), async(req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 0,
                message: 'No file uploaded'
            });
        }

        const user = await usermodel.findOne({
            _id: req.user._id
        });

        if (!user) {
            return res.status(404).json({
                status: 0,
                message: 'User not found'
            });
        }

        user.profilePicture = req.file.filename;
        await user.save();

        res.redirect('/profile');

    } catch (error) {
        res.status(500).json({
            status: 1,
            message: 'Upload failed',
            error: error.message
        });
    }
});
module.exports = router;