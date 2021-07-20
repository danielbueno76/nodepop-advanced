const createError = require("http-errors");
const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const multer = require("multer");
const upload = multer({ dest: path.join(__dirname, "public/images/") });
const mongoose = require("mongoose");

const app = express();

require("./lib/connectMongoose.js");

app.use(logger("dev"));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const version_1 = "v1";
// setup i18n
const i18n = require("./lib/i18nConfigure");
app.use(i18n.init);

/**
 * API paths
 */
app.use("/api/auth", require("./routes/api/authenticate"));
app.use(
  `/api/${version_1}/adverts`,
  upload.single("photo"),
  require("./routes/api/advertisement")
);
app.use("/change-locale", require("./routes/change-locale"));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  if (err instanceof mongoose.Error.ValidationError) {
    err.status = 400;
  }
  res.status(err.status || 500);

  res.json({ errorCause: err.message });
  return;
});

module.exports = app;
