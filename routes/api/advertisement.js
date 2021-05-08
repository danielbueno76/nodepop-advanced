"use strict";

const express = require("express");
const router = express.Router();

const jwtAuth = require("../../lib/jwtAuth");
const { Advertisement } = require("../../models");

/* GET /api/advertisement */
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

// GET /api/advertisement/:id
// Obtain an ad
router.get("/:id", async (req, res, next) => {
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

// POST /api/advertisement (body)
// Create an ad
router.post("/", async (req, res, next) => {
  try {
    const adData = req.body;

    const ad = new Advertisement(adData);

    const adCreado = await ad.save();

    res.status(201).json({ result: adCreado });
  } catch (error) {
    next(error);
  }
});

// PUT /api/advertisement/:id (body)
// Update an ad
router.put("/:id", async (req, res, next) => {
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

// DELETE /api/advertisement/:id
// Delete an ad
router.delete("/:id", async (req, res, next) => {
  try {
    const _id = req.params.id;

    await Advertisement.deleteOne({ _id: _id });

    res.json();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
