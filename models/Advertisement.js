"use strict";

const mongoose = require("mongoose");

// we define a schema for our document
const advertisementSchema = mongoose.Schema({
  name: { type: String, index: true },
  sale: { type: Boolean, index: true },
  price: { type: Number, index: true },
  photo: String,
  createdAt: Date,
  tags: [{ type: String, index: true }],
});

// list of ads
advertisementSchema.statics.list = function (
  filtro = {},
  limit = null,
  skip = null,
  fields = null,
  sort = null
) {
  const query = Advertisement.find(filtro);
  query.limit(limit);
  query.skip(skip);
  query.select(fields);
  query.sort(sort);
  return query.exec();
};

// list of ads
advertisementSchema.statics.listTags = function () {
  const query = Advertisement.find({}, { _id: false, tags: true });
  return query.exec();
};

// we create the model
const Advertisement = mongoose.model("Advertisement", advertisementSchema);

module.exports = Advertisement;
