"use strict";
const mongoose = require("mongoose");

String.prototype.toObjectId = function () {
  return new mongoose.Types.ObjectId(this.toString());
};

const express = require("express");
const router = express.Router();
const { jwtAuth, jwtReturnUser } = require("../../lib/jwtAuth");
const { Advertisement, User } = require("../../models");
const storeFileSmallName = require("../../lib/storeFileSmallName");
const cote = require("cote");
const requester = new cote.Requester({ name: "image client" });
const pathImages = "images/";

/* GET /api/v1/adverts */
// List of ads
router.get("/", async function (req, res, next) {
  try {
    const { name, price, sale, tags, fields, sort } = req.query;
    const limit = parseInt(req.query.limit);
    const start = parseInt(req.query.start);
    const filtro = {};

    if (name) {
      filtro.name = new RegExp(name, "i");
    }

    if (price) {
      let pricesArray = [];
      if (Array.isArray(price)) {
        pricesArray = price;
      } else if (price.search("-") !== -1) {
        pricesArray = price.split("-");
      } else {
        filtro.price = price;
      }

      if (pricesArray[0] === "") {
        filtro.price = { $lte: pricesArray[1] };
      } else if (pricesArray[1] === "") {
        filtro.price = { $gte: pricesArray[0] };
      } else if (pricesArray[0] !== "" && pricesArray[1] !== "") {
        filtro.price = { $gte: pricesArray[0], $lte: pricesArray[1] };
      }
    }

    if (sale) {
      filtro.sale = sale;
    }

    if (tags) {
      filtro.tags = { $in: tags };
    }
    const result = await Advertisement.list(filtro, limit, start, fields, sort);
    res.json(
      result.map((elem) => {
        return {
          id: elem.id,
          createdAt: elem.createdAt.toString(),
          updatedAt: elem.updatedAt.toString(),
          name: elem.name,
          price: elem.price,
          sale: elem.sale,
          tags: elem.tags,
          photo: elem.photo ? pathImages + elem.photo : null,
        };
      })
    );
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/adverts/tags
// Obtain tags
router.get("/tags", async (req, res, next) => {
  try {
    const result = await Advertisement.listTags();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/adverts/:id
// Obtain an ad
router.get("/:id", jwtAuth, async (req, res, next) => {
  try {
    const _id = req.params.id;

    const ad = await Advertisement.findById(_id);

    if (!ad) {
      return res.status(404).json({ error: "not found" });
    }
    res.json({ result: ad });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/adverts (body)
// Create an ad
router.post("/", jwtAuth, async (req, res, next) => {
  try {
    const adData = req.body;
    if (req.file) {
      // Send a message with fileName and full path.
      adData.photo = storeFileSmallName(req.file);
    }
    const ad = new Advertisement({
      ...adData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await User.checkUser(ad.username);

    const adCreated = await ad.save();

    res.status(201).json({
      id: adCreated.id,
      createdAt: adCreated.createdAt,
      updatedAt: adCreated.updatedAt,
      username: adCreated.username,
      name: adCreated.name,
      price: adCreated.price,
      sale: adCreated.sale,
      tags: adCreated.tags,
      photo: adCreated.photo ? pathImages + adCreated.photo : null,
    });

    // microservice that makes a thumbnail of the image
    requester.send(
      {
        type: "thumbnail",
        files: [req.file],
      },
      () => {
        console.log(`Finished resizing ${req.file.originalname}`);
      }
    );
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/adverts/:id (body)
// Update an ad
router.put("/:id", jwtAuth, async (req, res, next) => {
  try {
    const _id = req.params.id;
    const { username } = await User.findById(
      jwtReturnUser(req.headers.authorization)
    );
    const { username: usernameAd } = await Advertisement.findById(_id);
    await User.checkAdBelongToUsername(username, usernameAd);

    const adData = { ...req.body, updatedAt: Date.now() };
    if (adData.username) {
      const errorUsername = new Error("Cannot update username");
      errorUsername.status = 400;
      throw errorUsername;
    }

    const adActualizado = await Advertisement.findOneAndUpdate(
      { _id: _id },
      adData,
      {
        new: true,
        useFindAndModify: false,
      }
    );

    if (!adActualizado) {
      res.status(404).json({ error: "not found" });
      return;
    }

    res.json({ result: adActualizado });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/adverts/:id
// Delete an ad
router.delete("/:id", jwtAuth, async (req, res, next) => {
  try {
    const _id = req.params.id;
    const { id: userId, username } = await User.findById(
      jwtReturnUser(req.headers.authorization)
    );

    const ad = await Advertisement.findById(_id);
    if (ad) {
      await User.checkAdBelongToUsername(username, ad.username);
    } else {
      const error = new Error("You cannot delete an ad that does not exist.");
      error.status = 400;
      throw error;
    }

    await User.findByIdAndUpdate(userId, {
      $pull: { ads: _id.toObjectId() },
    });
    await Advertisement.deleteOne({ _id: _id });

    res.status(204).json("Ad deleted correctly");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
