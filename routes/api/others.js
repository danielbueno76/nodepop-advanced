"use strict";
/**
 * Endpoints that are not related to ads or users.
 */

const express = require("express");
const { User } = require("../../models");
const router = express.Router();

// GET /api/others/forgotPassword
// Send email because the user has forgotten the password.
router.get("/forgotPassword", async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ [ERROR_CAUSE]: "" });
    }
    res.status(200).json("");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
