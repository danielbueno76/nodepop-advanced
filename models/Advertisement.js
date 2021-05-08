'use strict'

const mongoose = require('mongoose')

// we define a schema for our document
const advertisementSchema = mongoose.Schema({
  name: { type: String, index: true },
  sale: { type: Boolean, index: true },
  price: { type: Number, index: true },
  photo: String,
  tags: [{ type: String, index: true }]
})

// list of ads
advertisementSchema.statics.list = function (filtro, limit, skip, fields, sort) {
  const query = Advertisement.find(filtro)
  query.limit(limit)
  query.skip(skip)
  query.select(fields)
  query.sort(sort)
  return query.exec()
}

// we create the model
const Advertisement = mongoose.model('Advertisement', advertisementSchema)

module.exports = Advertisement
