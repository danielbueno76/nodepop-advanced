"use strict";
/**
 * Endpoints that are not related to ads or users.
 */

const express = require("express");
const { User } = require("../../models");
const router = express.Router();

// GET /api/others/forgotPassword
// Send email because the user has forgotten the password.
router.post("/forgotPassword", async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ [ERROR_CAUSE]: "User not found." });
    }
    await user.sendEmail(
      "Reset your password",
      `Parece que has olvidado tu contraseña para acceder a wallaclone.<br/>Pincha en el siguiente enlace para elegir una nueva contraseña: <br/>${
        process.env.URL_RESET_PASSWORD
      }?${(Math.random() + 1).toString(36).substring(2)}`
    );
    res.status(200).json("Email send it correctly!");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
