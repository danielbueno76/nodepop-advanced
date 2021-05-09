"use strict";

const path = require("path");
const fs = require("fs");

// Return absolute path with original name of the image.
module.exports = function (file) {
  const fullNewPath = path.join(file.destination, file.originalname);
  fs.renameSync(file.path, fullNewPath);
  return file.originalname;
};
