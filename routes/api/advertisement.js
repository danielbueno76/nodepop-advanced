"use strict";

const express = require("express");
const router = express.Router();

const jwtAuth = require("../../lib/jwtAuth");
const { Advertisement } = require("../../models");
const storeFileSmallName = require("../../lib/storeFileSmallName");
const cote = require("cote");
const requester = new cote.Requester({ name: "image client" });

/* GET /api/v1/adverts */
// List of ads
router.get("/", jwtAuth, async function (req, res, next) {
  try {
    const name = req.query.name;
    const price = req.query.price;
    const sale = req.query.sale;
    const tag = req.query.tag;
    const limit = parseInt(req.query.limit);
    const start = parseInt(req.query.start);
    const fields = req.query.fields;
    const sort = req.query.sort;
    const filtro = {};

    if (name) {
      filtro.name = new RegExp(name, "i");
    }

    if (price) {
      if (price.search("-") !== -1) {
        const pricesArray = price.split("-");
        if (pricesArray[0] === "") {
          filtro.price = { $lt: pricesArray[1] };
        } else if (pricesArray[1] === "") {
          filtro.price = { $gt: pricesArray[0] };
        } else if (pricesArray[0] !== "" && pricesArray[1] !== "") {
          filtro.price = { $gt: pricesArray[0], $lt: pricesArray[1] };
        }
      } else {
        filtro.price = price;
      }
    }

    if (sale) {
      filtro.sale = sale;
    }

    if (tag) {
      filtro.tags = { $in: tag };
    }

    const result = await Advertisement.list(filtro, limit, start, fields, sort);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/adverts/tags
// Obtain tags
router.get("/tags", async (req, res, next) => {
  try {
    const result = await Advertisement.listTags();
    let resultAdapted = [];
    result.forEach((element) => {
      resultAdapted = [...resultAdapted, ...element.tags];
    });
    resultAdapted = [...new Set(resultAdapted)]; // remove duplicates
    res.json(resultAdapted);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/adverts/:id
// Obtain an ad
router.get("/:id", jwtAuth, async (req, res, next) => {
  try {
    const _id = req.params.id;

    const ad = await Advertisement.findOne({ _id: _id });

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
    const ad = new Advertisement(adData);

    const adCreated = await ad.save();
    res.status(201).json({ result: adCreated });

    // microservice that makes a thumbnail of the image
    requester.send(
      {
        type: "thumbnail",
        files: [req.file],
      },
      () => {
        console.log(`Finished resizing ${req.file.originalname}`);
        return;
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
    const adData = req.body;

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

    await Advertisement.deleteOne({ _id: _id });

    res.json();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
