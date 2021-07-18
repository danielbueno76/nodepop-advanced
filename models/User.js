"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    unique: true,
    index: true,
    required: [true, "The name is mandatory"],
  },
  email: {
    type: String,
    unique: true,
    index: true,
    required: [true, "The email is mandatory"],
  },
  password: { type: String, required: [true, "The password is mandatory"] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  ads: { type: [mongoose.ObjectId], index: true },
});

userSchema.statics.checkEmail = async function (email) {
  const user = await User.findOne({ email });
  if (!user) {
    const emailError = new Error(
      `The email ${email} of this user does not exist`
    );
    emailError.status = 400;
    throw emailError;
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
