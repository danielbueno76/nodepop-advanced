"use strict";
/**
 * Endpoints related to an user
 */
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const { User, Advertisement } = require("../../models");
const { jwtAuth, jwtReturnUser, jwtSign } = require("../../lib/jwtAuth");
const {
  consts: {
    USER_EMAIL_UNIQUE,
    ERROR_CAUSE,
    ERROR_NOT_FOUND,
    ID,
    EXPIRED_TIME_LOGIN,
  },
} = require("../../utils");

// POST /api/auth/login (body)
// Return JWT token
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await user.comparePassword(password))) {
      const error = new Error("invalid_credentials");
      error.status = 401;
      next(error);
      return;
    }

    // create token JWT (signed)
    const jwtToken = await jwtSign(user, EXPIRED_TIME_LOGIN);
    res.json({ accessToken: jwtToken });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/signup (body)
// Sign up in the web
router.post("/signup", async (req, res, next) => {
  try {
    const signupData = req.body;

    const signup = new User({
      ...signupData,
      ads: [],
      adsFav: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    signup.password = await User.hashPassword(signup.password);
    const signupCreated = await signup.save();

    res.status(201).json(signupCreated);
  } catch (error) {
    if (error.name === "MongoError" && error.code === 11000) {
      const customError = new Error(USER_EMAIL_UNIQUE);
      customError.status = 400;
      next(customError);
    } else {
      next(error);
    }
  }
});

// GET /api/auth/me
// Obtain info about user
router.get("/me", jwtAuth, async (req, res, next) => {
  try {
    const userId = jwtReturnUser(req.headers.authorization);
    const user = await User.findOne({ [ID]: mongoose.Types.ObjectId(userId) });
    if (!user) {
      return res.status(400).json({ [ERROR_CAUSE]: "username_not_found" });
    }
    res.json({
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
      email: user.email,
      updatedAt: user.updatedAt,
      ads: user.ads,
      adsFav: user.adsFav,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/checkPassword
// Check if password is correct
router.post("/checkPassword", jwtAuth, async (req, res, next) => {
  try {
    const userId = jwtReturnUser(req.headers.authorization);
    const { password } = req.body;
    const user = await User.findOne({ [ID]: mongoose.Types.ObjectId(userId) });
    if (!user || !(await user.comparePassword(password))) {
      const error = new Error("invalid_credentials");
      error.status = 401;
      next(error);
      return;
    }
    res.status(200).json("password_ok");
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/me
// Modify info about user
router.put("/me", jwtAuth, async (req, res, next) => {
  try {
    const userId = jwtReturnUser(req.headers.authorization);
    const userData = { ...req.body, updatedAt: Date.now() };
    if (userData.ads || userData.createdAt) {
      return res.status(400).json({
        [ERROR_CAUSE]: "user_not_update",
      });
    }
    if (userData.password) {
      userData.password = await User.hashPassword(userData.password);
    }
    const userActualizado = await User.findOneAndUpdate(
      { [ID]: mongoose.Types.ObjectId(userId) },
      userData,
      {
        new: true,
        useFindAndModify: false,
      }
    );
    if (!userActualizado) {
      res.status(404).json({ [ERROR_CAUSE]: ERROR_NOT_FOUND });
      return;
    }

    res.json({
      result: {
        id: userActualizado.id,
        username: userActualizado.username,
        createdAt: userActualizado.createdAt,
        email: userActualizado.email,
        updatedAt: userActualizado.updatedAt,
        ads: userActualizado.ads,
        adsFav: userActualizado.adsFav,
      },
    });
  } catch (error) {
    if (error.name === "MongoError" && error.code === 11000) {
      const customError = new Error(USER_EMAIL_UNIQUE);
      customError.status = 400;
      next(customError);
    } else {
      next(error);
    }
  }
});

// DELETE /api/auth/me
// Delete an user
router.delete("/me", jwtAuth, async (req, res, next) => {
  try {
    const userId = jwtReturnUser(req.headers.authorization);

    const { ads } = await User.findOne({
      [ID]: mongoose.Types.ObjectId(userId),
    });
    for (const ad of ads) {
      await Advertisement.deleteOne({ [ID]: ad });
    }
    await User.deleteOne({ [ID]: userId });
    res.status(204).json("user_delete_ok");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
