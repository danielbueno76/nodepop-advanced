const express = require("express");
const router = express.Router();
const { Advertisement } = require("../models");

/* GET home page. */
router.get("/", async function (req, res, next) {
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

  res.locals.ads = await Advertisement.list(filtro, limit, start, fields, sort);
  res.render("index");
});

module.exports = router;
