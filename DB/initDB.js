"use strict";

require("dotenv").config();
const mongoose = require("mongoose");
const cote = require("cote");
const requester = new cote.Requester({ name: "image client", timeout: 2000 });
const path = require("path");
const conn = require("../lib/connectMongoose");
const { Advertisement, User } = require("../models");
const adsInit = require("./ads.json");
const usersInit = require("./users.json");

conn.once("open", async () => {
  try {
    await initUsers();
    await initAds();
    console.log("The initialization of the database has been successfully.");
    conn.close();
  } catch (err) {
    console.error("There was an error:", err);
    process.exit(1);
  }
});

async function initAds() {
  await Advertisement.deleteMany();
  const adsInserted = await Advertisement.insertMany(
    await Promise.all(
      adsInit.map(async (adInit) => {
        await User.checkUser(adInit.username);
        return { ...adInit, createdAt: Date.now(), updatedAt: Date.now() };
      })
    )
  );
  for (const adInserted of adsInserted) {
    await User.updateOne(
      { username: adInserted.username },
      { $push: { ads: adInserted.id } }
    );
  }

  for (let i = adsInserted.length - 1; i >= 0; i--) {
    await User.updateOne(
      { username: adsInserted[i].username },
      { $push: { adsFav: adsInserted[i === 0 ? i + 1 : i - 1].id } }
    );
  }

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
  const usersHashInit = await Promise.all(
    usersInit.map(async (userInit) => {
      return {
        ...userInit,
        password: await User.hashPassword(userInit.password),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    })
  );

  await User.insertMany(usersHashInit);
}
