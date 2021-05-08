"use strict";

require("dotenv").config();

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
