"use strict";
/**
 * Endpoints related to advertisements
 */
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const { jwtAuth, jwtReturnUser } = require("../../lib/jwtAuth");
const { Advertisement, User } = require("../../models");
const storeFileSmallName = require("../../lib/storeFileSmallName");
const cote = require("cote");
const requester = new cote.Requester({ name: "image client" });
const pathImages = "/images/";
const {
  consts: { ERROR_CAUSE, ERROR_NOT_FOUND, ID },
  utils: { filterByFieldAd },
} = require("../../utils");

/* GET /api/v1/adverts */
// List of ads
router.get("/", async function (req, res, next) {
  try {
    const { name, price, sale, tags, username, fields, sort } = req.query;
    const limit = parseInt(req.query.limit);
    const page = parseInt(req.query.page);
    const filter = filterByFieldAd(name, price, sale, tags, username);

    const result = await Advertisement.list(filter, limit, page, fields, sort);
    res.status(200).json(
      result.map((elem) => {
        return {
          id: elem.id,
          createdAt: elem.createdAt.toString(),
          updatedAt: elem.updatedAt.toString(),
          name: elem.name,
          price: elem.price,
          description: elem.description,
          sale: elem.sale,
          tags: elem.tags,
          booked: elem.booked,
          sold: elem.sold,
          username: elem.username,
          photo: elem.photo ? pathImages + elem.photo : null,
        };
      })
    );
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/adverts/number
// Obtain number of ads
router.get("/number", async (req, res, next) => {
  try {
    const { name, price, sale, tags } = req.query;
    const filter = filterByFieldAd(name, price, sale, tags);
    const result = await Advertisement.countAds(filter);
    res.status(200).json({ number: result });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/adverts/tags
// Obtain tags
router.get("/tags", async (req, res, next) => {
  try {
    const result = await Advertisement.listTags();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/adverts/:id
// Obtain an ad
router.get("/:id", async (req, res, next) => {
  try {
    const _id = req.params.id;

    const ad = await Advertisement.findOne({
      [ID]: mongoose.Types.ObjectId(_id),
    });
    if (!ad) {
      return res.status(404).json({ [ERROR_CAUSE]: ERROR_NOT_FOUND });
    }
    res.status(200).json({
      id: ad.id,
      createdAt: ad.createdAt.toString(),
      updatedAt: ad.updatedAt.toString(),
      name: ad.name,
      price: ad.price,
      description: ad.description,
      sale: ad.sale,
      tags: ad.tags,
      username: ad.username,
      booked: ad.booked,
      sold: ad.sold,
      photo: ad.photo ? pathImages + ad.photo : null,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/adverts (body)
// Create an ad
router.post("/", jwtAuth, async (req, res, next) => {
  try {
    const adData = req.body;
    const userId = jwtReturnUser(req.headers.authorization);
    const user = await User.findOne({ [ID]: mongoose.Types.ObjectId(userId) });

    if (req.file) {
      // Send a message with fileName and full path.
      adData.photo = storeFileSmallName(req.file);
    }

    if (!user) {
      return res.status(400).json({
        [ERROR_CAUSE]: user ? "username_not_found" : "username_mandatory_ad",
      });
    }
    const ad = new Advertisement({
      ...adData,
      username: user.username,
      tags: adData.tags && adData.tags.split(","),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    const adCreated = await ad.save();

    //store ad in array ads of document user
    await User.findByIdAndUpdate(userId, {
      $push: { ads: mongoose.Types.ObjectId(adCreated.id) },
    });
    res.status(201).json({
      id: adCreated.id,
      description: adCreated.description,
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
    const user = await User.findOne({
      [ID]: mongoose.Types.ObjectId(jwtReturnUser(req.headers.authorization)),
    });
    const ad = await Advertisement.findOne({
      [ID]: mongoose.Types.ObjectId(_id),
    });
    if (user && !(await user.checkAdBelongToUsername(ad))) {
      return res.status(403).json({
        [ERROR_CAUSE]: "ad_not_owner_update",
      });
    }
    if (!ad) {
      return res.status(404).json({
        [ERROR_CAUSE]: "ad_not_exist_update",
      });
    }
    const adData = { ...req.body, updatedAt: Date.now() };
    if (adData.username) {
      return res.status(400).json({ [ERROR_CAUSE]: "ad_not_update_username" });
    }
    adData.tags && (adData.tags = adData.tags.split(","));

    if (req.file) {
      // Send a message with fileName and full path.
      adData.photo = storeFileSmallName(req.file);
    }
    const adActualizado = await Advertisement.findOneAndUpdate(
      { [ID]: mongoose.Types.ObjectId(_id) },
      adData,
      {
        new: true,
        useFindAndModify: false,
      }
    );

    if (!adActualizado) {
      res.status(404).json({ [ERROR_CAUSE]: ERROR_NOT_FOUND });
      return;
    }
    res.json({
      result: {
        id: adActualizado.id,
        createdAt: adActualizado.createdAt.toString(),
        updatedAt: adActualizado.updatedAt.toString(),
        name: adActualizado.name,
        price: adActualizado.price,
        description: adActualizado.description,
        sale: adActualizado.sale,
        tags: adActualizado.tags,
        username: adActualizado.username,
        booked: adActualizado.booked,
        sold: adActualizado.sold,
        photo: adActualizado.photo ? pathImages + adActualizado.photo : null,
      },
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/adverts/:id
// Delete an ad
router.delete("/:id", jwtAuth, async (req, res, next) => {
  try {
    const _id = req.params.id;
    const user = await User.findOne({
      [ID]: mongoose.Types.ObjectId(jwtReturnUser(req.headers.authorization)),
    });

    const ad = await Advertisement.findOne({
      [ID]: mongoose.Types.ObjectId(_id),
    });
    if (!ad) {
      return res.status(404).json({
        [ERROR_CAUSE]: "ad_not_exist_delete",
      });
    }

    if (user && !(await user.checkAdBelongToUsername(ad))) {
      return res.status(403).json({
        [ERROR_CAUSE]: "ad_not_owner_delete",
      });
    }

    await User.findByIdAndUpdate(user.id, {
      $pull: {
        ads: mongoose.Types.ObjectId(_id),
      },
    });
    await User.updateMany(
      {},
      {
        $pull: {
          adsFav: mongoose.Types.ObjectId(_id),
        },
      }
    );
    await Advertisement.deleteOne({ [ID]: mongoose.Types.ObjectId(_id) });

    res.status(204).json("ad_deleted_ok");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
