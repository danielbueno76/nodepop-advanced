"use strict";

require("dotenv").config();
const cote = require("cote");
const requester = new cote.Requester({ name: "image client", timeout: 2000 });
const path = require("path");
const conn = require("../lib/connectMongoose");
const { Advertisement, User } = require("../models");
const adsInit = require("./ads.json");

conn.once("open", async () => {
  try {
    await initAdsNodepop();
    await initUsers();
    console.log("The initialization of the database has been successfully.");
    conn.close();
  } catch (err) {
    console.error("There was an error:", err);
    process.exit(1);
  }
});

async function initAdsNodepop() {
  await Advertisement.deleteMany();
  await Advertisement.insertMany(adsInit);
  let files = [];

  adsInit.forEach((adInit) => {
    files.push({
      destination: path.join(__dirname, "../public/images/"),
      originalname: adInit.photo,
    });
  });

  // microservice that makes a thumbnail of the image
  requester
    .send({
      type: "thumbnail",
      files,
    })
    .then(() => {
      files.forEach((file) => {
        console.log(`Finished resizing ${file.originalname}`);
      });
      process.exit(0);
    })
    .catch((e) => {
      const error = new Error(e);
      if (error.toString().includes("Request timed out")) {
        process.exit(0);
      }
      console.log("error", e);
      process.exit(1);
    });
}

async function initUsers() {
  await User.deleteMany();
  await User.insertMany([
    {
      email: "user@example.com",
      password: await User.hashPassword("1234"),
    },
  ]);
}
