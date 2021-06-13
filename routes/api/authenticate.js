"use strict";

const express = require("express");
const router = express.Router();
const { User } = require("../../models");
const jwt = require("jsonwebtoken");

// POST /api/auth/login (body)
// Return JWT token
router.post("/", async (req, res, next) => {
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
      { expiresIn: "2h" },
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

module.exports = router;
