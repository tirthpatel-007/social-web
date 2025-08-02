const mongoose = require("mongoose");
const plm = require('passport-local-mongoose')
mongoose.connect(process.env.MONGODB_URL || "mongodb://localhost:27017/pintrest", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const user = mongoose.Schema({
  username: {
    type: String,
    required: true,
     sparse: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
  },
  post:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  contact:{
    type: Number,
  },
  googleId: {
        type: String,
        unique: true,
        sparse: true
    },
  profilePicture: {
    type: String, 
    default: ""
  },

});
user.plugin(plm)
module.exports = mongoose.model('User', user)
