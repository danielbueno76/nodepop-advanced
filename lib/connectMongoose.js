"use strict";

const mongoose = require("mongoose");

mongoose.connection.on("error", (err) => {
  console.log("Connection error:", err);
  process.exit(1);
});

mongoose.connection.once("open", () => {
  console.log("Connecting to MongoDB in", mongoose.connection.name);
});

mongoose.connect(process.env.MONGODB_CONNECTION_STR, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

module.exports = mongoose.connection;
