const mongoose = require("mongoose");


const post = mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", post);
