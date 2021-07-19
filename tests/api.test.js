"use strict";

require("dotenv").config();

const request = require("supertest");
const app = require("../app");
const usersInit = require("../DB/users.json");
const adsInit = require("../DB/ads.json");
const randomString = Math.random().toString(36).substring(7);
const userToAdd = {
  username: randomString,
  email: `${randomString}@example.com`,
  password: "1234",
};

describe("Signup user, authenticate and test it.", () => {
  let token = "";
  it("POST /api/auth/signup should return a json response with information of the user that has just registered", function (done) {
    request(app).post("/api/auth/signup").send(userToAdd).expect(201, done);
  });
  it("POST /api/auth/signup of an existing user should return 400", function (done) {
    request(app).post("/api/auth/signup").send(userToAdd).expect(400, done);
  });
  it("POST /api/auth/login should return a json response with a token JWT and status 200", function (done) {
    request(app)
      .post("/api/auth/login")
      .send(userToAdd)
      .expect(200)
      .end((err, res) => {
        token = res.body.accessToken;
        done(err);
      });
  });
  it("POST /api/auth/login without body should return 401", function (done) {
    request(app).post("/api/auth/login").send({}).expect(401, done);
  });
  it("[AUTH] GET /api/auth/me with token should return status 200 and JSON", function (done) {
    request(app)
      .get(`/api/auth/me`)
      .set("Authorization", "Bearer " + token)
      .expect(200, done);
  });
  it("[AUTH] GET /api/v1/adverts with token should return status 200 and JSON", function (done) {
    request(app)
      .get(`/api/v1/adverts`)
      .set("Authorization", "Bearer " + token)
      .expect(200, done);
  });
  it("DELETE /api/auth/me of an existing user should return 200", function (done) {
    request(app)
      .delete("/api/auth/me")
      .set("Authorization", "Bearer " + token)
      .expect(204, done);
  });
});

describe("Authentication", () => {
  let token = "";
  it("POST /api/auth/login should return a json response with a token JWT and status 200", function (done) {
    request(app)
      .post("/api/auth/login")
      .send(usersInit[0])
      .expect(200)
      .end((err, res) => {
        token = res.body.accessToken;
        done(err);
      });
  });
  it("[AUTH] GET /api/auth/me with token should return status 200 and JSON", function (done) {
    request(app)
      .get(`/api/auth/me`)
      .set("Authorization", "Bearer " + token)
      .expect(200, done);
  });
  it("[AUTH] GET /api/v1/adverts with token should return status 200 and JSON", function (done) {
    request(app)
      .get(`/api/v1/adverts`)
      .set("Authorization", "Bearer " + token)
      .expect(200, done);
  });
});

describe("Ads operations", () => {
  let token = "";
  let idAd = "";
  it("POST /api/auth/login should return a json response with a token JWT and status 200", function (done) {
    request(app)
      .post("/api/auth/login")
      .send(usersInit[0])
      .expect(200)
      .end((err, res) => {
        token = res.body.accessToken;
        done(err);
      });
  });
  it("[AUTH] POST /api/v1/adverts with token should return status 201 and JSON", function (done) {
    request(app)
      .post(`/api/v1/adverts`)
      .set("Authorization", "Bearer " + token)
      .send(adsInit[0])
      .expect(201)
      .end((err, res) => {
        idAd = res.body.id;
        done(err);
      });
  });
  it("[AUTH] GET /api/v1/adverts/:id with token should return status 200 and JSON", function (done) {
    request(app)
      .get(`/api/v1/adverts/${idAd}`)
      .set("Authorization", "Bearer " + token)
      .expect(200, done);
  });
  it("[AUTH] PUT /api/v1/adverts/:id with token should return status 200 and JSON", function (done) {
    request(app)
      .put(`/api/v1/adverts/${idAd}`)
      .set("Authorization", "Bearer " + token)
      .send({ price: 50 })
      .expect(200, done);
  });
  it("[AUTH] DELETE /api/v1/adverts/:id with token should return status 204 and JSON", function (done) {
    request(app)
      .delete(`/api/v1/adverts/${idAd}`)
      .set("Authorization", "Bearer " + token)
      .expect(204, done);
  });
});
