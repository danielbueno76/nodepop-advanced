"use strict";

const express = require("express");
const router = express.Router();
const { User } = require("../../models");
const jwt = require("jsonwebtoken");
const { jwtAuth, jwtReturnUser } = require("../../lib/jwtAuth");
const EXPIRED_TIME = "12h";
// POST /api/auth/login (body)
// Return JWT token
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      const error = new Error("Invalid credentials");
      error.status = 401;
      next(error);
      return;
    }

    // create token JWT (signed)
    jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: EXPIRED_TIME },
      (err, jwtToken) => {
        if (err) {
          next(err);
          return;
        }
        res.json({ accessToken: jwtToken });
      }
    );
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/signup (body)
// Create an ad
router.post("/signup", async (req, res, next) => {
  try {
    const signupData = req.body;

    const signup = new User({
      ...signupData,
      ads: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const signupCreated = await signup.save();

    res.status(201).json(signupCreated);
  } catch (error) {
    if (error.name === "MongoError" && error.code === 11000) {
      const customError = new Error("username and email must be unique!");
      customError.status = 400;
      next(customError);
    } else {
      next(error);
    }
  }
});

// GET /api/auth/me
// Obtain an ad
router.get("/me", jwtAuth, async (req, res, next) => {
  try {
    const jwtToken = req.headers.authorization;
    const userId = jwtReturnUser(jwtToken);
    res.json(await User.findById(userId));
  } catch (err) {
    next(err);
  }
});
module.exports = router;
