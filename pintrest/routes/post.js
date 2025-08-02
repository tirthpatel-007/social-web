const mongoose = require("mongoose");


const post = mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String, // Optional image (URL or path)
    default: "",
  },
  title: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", post);
