"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Advertisement } = require("./Advertisement");

const reEmail =
  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

const userSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true,
    index: true,
    required: [true, "The username is mandatory"],
  },
  email: {
    type: String,
    unique: true,
    index: true,
    validate: {
      validator: function (v) {
        return reEmail.test(v);
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
    required: [true, "The email is mandatory"],
  },
  password: { type: String, required: [true, "The password is mandatory"] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  ads: { type: [String], index: true },
  adsFav: { type: [String], index: true },
});

userSchema.statics.checkUser = async function (username) {
  const user = await User.findOne({ username });
  if (!user) {
    const userError = new Error(
      username
        ? `The username ${username} does not exist.`
        : "You must introduce the username who created this ad."
    );
    userError.status = 400;
    throw userError;
  }
};

userSchema.statics.checkAdBelongToUsername = async function (
  username,
  usernameAd
) {
  if (username.localeCompare(usernameAd)) {
    const error = new Error(
      "You cannot update this ad because you are not the owner."
    );
    error.status = 403;
    throw error;
  }
};

// it won't work with arrow functions
userSchema.statics.hashPassword = function (passwordNotEncrypted) {
  return bcrypt.hash(passwordNotEncrypted, 7);
};

userSchema.methods.comparePassword = function (passwordNotEncrypted) {
  return bcrypt.compare(passwordNotEncrypted, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
