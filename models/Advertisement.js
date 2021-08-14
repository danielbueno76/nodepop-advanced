"use strict";

const mongoose = require("mongoose");
const TAGS = ["lifestyle", "motor", "mobile", "work"];

// we define a schema for our document
const advertisementSchema = mongoose.Schema({
  name: {
    type: String,
    index: true,
    required: [true, "The name of the ad is mandatory"],
  },
  sale: {
    type: Boolean,
    index: true,
    required: [true, "The sale is mandatory"],
  },
  price: {
    type: Number,
    min: 0.0,
    index: true,
    required: [true, "The price is mandatory"],
  },
  description: {
    type: String,
    required: [true, "The description is mandatory"],
  },
  photo: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  tags: {
    type: [String],
    enum: {
      values: TAGS,
      message:
        "{VALUE} is not supported. Choose one of the following tags: " +
        TAGS.join(", "),
    },
    validate: (v) => Array.isArray(v) && v.length > 0,
    index: true,
  },
  username: {
    type: String,
    required: [true, "The username is mandatory"],
    index: true,
  },
  booked: {
    type: Boolean,
    default: false,
  },
  sold: {
    type: Boolean,
    default: false,
  },
});

// list of ads
advertisementSchema.statics.list = function (
  filtro = {},
  limit = null,
  page = 1,
  fields = null,
  sort = null
) {
  const query = Advertisement.find(filtro);
  query.limit(limit);
  query.skip((page - 1) * limit);
  query.select(fields);
  if (sort instanceof Array && sort.length === 2) {
    query.sort([sort]);
  } else {
    query.sort(sort);
  }
  return query.exec();
};

// list of ads
advertisementSchema.statics.listTags = function () {
  return TAGS;
};

//count ads
advertisementSchema.statics.countAds = function () {
  return Advertisement.countDocuments({});
};

// we create the model
const Advertisement = mongoose.model("Advertisement", advertisementSchema);

module.exports = Advertisement;
