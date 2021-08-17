"use strict";
/**
 * Endpoints related to advertisements
 */
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const { jwtAuth, jwtReturnUser } = require("../../lib/jwtAuth");
const { User } = require("../../models");
const {
  consts: { ERROR_CAUSE, ERROR_NOT_FOUND, ID },
  utils: { filterByFieldUser },
} = require("../../utils");

/* GET /api/v1/users */
// List of users
router.get("/", async function (req, res, next) {
  try {
    const { username, email, sort } = req.query;
    const filter = filterByFieldUser(username, email);

    const result = await User.list(filter, sort);
    res.status(200).json(
      result.map((elem) => {
        return {
          id: elem.id,
          createdAt: elem.createdAt.toString(),
          updatedAt: elem.updatedAt.toString(),
          username: elem.username,
          email: elem.email,
          ads: elem.ads,
          adsFav: elem.adsFav,
        };
      })
    );
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/users/:id
// Obtain an user
router.get("/:id", async (req, res, next) => {
  try {
    const _id = req.params.id;

    const user = await User.findOne({
      [ID]: mongoose.Types.ObjectId(_id),
    });
    if (!user) {
      return res.status(404).json({ [ERROR_CAUSE]: ERROR_NOT_FOUND });
    }
    res.status(200).json({
      id: user.id,
      createdAt: user.createdAt.toString(),
      updatedAt: user.updatedAt.toString(),
      username: user.username,
      email: user.email,
      ads: user.ads,
      adsFav: user.adsFav,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
