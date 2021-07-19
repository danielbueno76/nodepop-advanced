"use strict";

const jwt = require("jsonwebtoken");
const { User } = require("../models");
const jwtAuth = (req, res, next) => {
  let jwtToken =
    req.get("Authorization") || req.query.accessToken || req.body.accessToken;

  if (jwtToken && jwtToken.includes("Bearer ")) {
    jwtToken = jwtToken.replace("Bearer ", "");
  }
  if (!jwtToken) {
    const error = new Error("no token provided");
    error.status = 401;
    next(error);
    return;
  }
  jwt.verify(jwtToken, process.env.JWT_SECRET, async (err, payload) => {
    if (err) {
      err.status = 401;
      next(err);
      return;
    }
    if (!(await User.findById(payload._id))) {
      const errorNotExistUser = new Error(
        `The user id ${payload._id} does not exist.`
      );
      errorNotExistUser.status = 400;
      next(errorNotExistUser);
      return;
    }
    req.apiAuthUserId = payload._id;
    next();
    return;
  });
};

const jwtReturnUser = (jwtToken) => {
  if (jwtToken && jwtToken.includes("Bearer ")) {
    jwtToken = jwtToken.replace("Bearer ", "");
  }

  const payload = jwt.verify(jwtToken, process.env.JWT_SECRET);
  return payload._id;
};

module.exports = {
  jwtAuth,
  jwtReturnUser,
};
