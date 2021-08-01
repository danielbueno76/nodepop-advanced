"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const emailTransportConfigure = require("../lib/emailTransportConfigure");

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

userSchema.statics.doesUserExist = async function (username) {
  const user = await this.findOne({ username });
  if (user) {
    return true;
  }
  return false;
};

userSchema.statics.checkAdBelongToUsername = async function (username, ad) {
  if (username && username.localeCompare(ad.username) == 0) {
    return true;
  }
  return false;
};

// it won't work with arrow functions
userSchema.statics.hashPassword = function (passwordNotEncrypted) {
  return bcrypt.hash(passwordNotEncrypted, 7);
};

userSchema.methods.comparePassword = function (passwordNotEncrypted) {
  return bcrypt.compare(passwordNotEncrypted, this.password);
};

userSchema.methods.sendEmail = async function (subject, body) {
  const transport = await emailTransportConfigure();

  return transport.sendMail({
    from: process.env.EMAIL_SERVICE_FROM,
    to: this.email,
    subject,
    html: body,
  });
};

const User = mongoose.model("User", userSchema);

module.exports = User;
