"use strict";

const nodemailer = require("nodemailer");

module.exports = async function () {
  const developTransport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_SERVICE_USER,
      pass: process.env.EMAIL_SERVICE_PASS,
    },
  });

  const prodTransport = {
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_SERVICE_USER,
      pass: process.env.EMAIL_SERVICE_PASS,
    },
  };

  const transportInfo =
    process.env.NODE_ENV === "development" ? developTransport : prodTransport;

  // crear un transport
  return nodemailer.createTransport(transportInfo);
};
