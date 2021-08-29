"use strict";
/**
 * Endpoints that are not related to ads or users.
 */

const express = require("express");
const { User } = require("../../models");
const router = express.Router();
const {
  consts: { ERROR_CAUSE, EXPIRED_TIME_RESET_PASSWORD },
} = require("../../utils");
const { jwtSign } = require("../../lib/jwtAuth");

// GET /api/others/forgotPassword
// Send email because the user has forgotten the password.
router.post("/forgotPassword", async (req, res, next) => {
  try {
    const { email, subject, body } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ [ERROR_CAUSE]: "username_not_found" });
    }
    await user.sendEmail(subject, body);
    res.status(200).json("email_ok");
  } catch (err) {
    next(err);
  }
});

router.post("/signEmail", async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // create token JWT (signed)
    const jwtToken = await jwtSign(user, EXPIRED_TIME_RESET_PASSWORD);
    res.status(200).json({ token: jwtToken });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
