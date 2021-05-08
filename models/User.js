"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
});

// it won't work with arrow functions
userSchema.statics.hashPassword = function (passwordNotEncrypted) {
  return bcrypt.hash(passwordNotEncrypted, 7);
};

userSchema.methods.comparePassword = function (passwordNotEncrypted) {
  return bcrypt.compare(passwordNotEncrypted, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
