const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const multer = require("multer");
const upload = multer({ dest: path.join(__dirname, "public/images/") });

const app = express();

require("./lib/connectMongoose.js");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");
app.engine("html", require("ejs").__express);

app.locals.title = "Nodepop";

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// setup i18n
const i18n = require("./lib/i18nConfigure");
app.use(i18n.init);

/**
 * API paths
 */
30013001app.use("/api/auth/login", require("./routes/api/authenticate"));
app.use(
  "/api/v1/adverts",
  upload.single("photo"),
  require("./routes/api/advertisement")
);

/**
 * Website paths
 */
app.use("/", require("./routes/index"));
app.use("/change-locale", require("./routes/change-locale"));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // render the error page
  res.status(err.status || 500);

  if (isAPIRequest(req)) {
    res.json({ error: err.message });
    return;
  }

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.render("error");
});

function isAPIRequest(req) {
  return req.originalUrl.indexOf("/api/") === 0;
}

module.exports = app;
