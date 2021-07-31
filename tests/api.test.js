"use strict";

require("dotenv").config();

const request = require("supertest");
const app = require("../app");
const usersInit = require("../DB/users.json");
const adsInit = require("../DB/ads.json");

let token = "";
describe("Signup user, authenticate and test it.", () => {
  const randomString = Math.random().toString(36).substring(7);
  const userToAdd = {
    username: randomString,
    email: `${randomString}@example.com`,
    password: "1234",
  };
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
  it("[AUTH] GET /api/auth/me with token should return status 200 and JSON", function (done) {
    request(app)
      .get(`/api/auth/me`)
      .set("Authorization", "Bearer " + token)
      .expect(200, done);
  });
  it("[AUTH] PUT /api/auth/me with token should return status 200 and JSON", function (done) {
    request(app)
      .put(`/api/auth/me`)
      .send({ username: "userX" })
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

let idAdTemp = "";
let idAdToTest = "";
describe("Ads basic operations", () => {
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
        idAdTemp = res.body.id;
        done(err);
      });
  });
  it("[AUTH] GET /api/v1/adverts with token should return status 200 and JSON", function (done) {
    request(app)
      .get(`/api/v1/adverts`)
      .expect(200)
      .end((err, res) => {
        idAdToTest = res.body[1].id;
        done(err);
      });
  });
  it("[AUTH] GET /api/v1/adverts/:id with token should return status 200 and JSON", function (done) {
    request(app)
      .get(`/api/v1/adverts/${idAdTemp}`)
      .set("Authorization", "Bearer " + token)
      .expect(200, done);
  });
  it("[AUTH] GET /api/v1/adverts/tags with token should return status 200 and JSON", function (done) {
    request(app).get(`/api/v1/adverts/tags`).expect(200, done);
  });
  it("[AUTH] PUT /api/v1/adverts/:id with token should return status 200 and JSON", function (done) {
    request(app)
      .put(`/api/v1/adverts/${idAdTemp}`)
      .set("Authorization", "Bearer " + token)
      .send({ price: 50 })
      .expect(200, done);
  });
  it("[AUTH] PUT /api/auth/me/fav?action=add adding id of ads to fav list", function (done) {
    request(app)
      .put(`/api/auth/me/fav?action=add`)
      .send({ idAdFav: idAdTemp })
      .set("Authorization", "Bearer " + token)
      .expect(200, done);
  });
  it("[AUTH] DELETE /api/v1/adverts/:id with token should return status 204 and JSON", function (done) {
    request(app)
      .delete(`/api/v1/adverts/${idAdTemp}`)
      .set("Authorization", "Bearer " + token)
      .expect(204, done);
  });
});

describe("Ads wrong operations", () => {
  it("[AUTH] POST /api/v1/adverts with username that does not exist should return status 400", function (done) {
    request(app)
      .post(`/api/v1/adverts`)
      .set("Authorization", "Bearer " + token)
      .send({ ...adsInit[0], username: "userNotExist" })
      .expect(400, done);
  });
  it("[AUTH] PUT /api/v1/adverts/:id of an ad that does not belong to the current user should return status 403", function (done) {
    request(app)
      .put(`/api/v1/adverts/${idAdToTest}`)
      .set("Authorization", "Bearer " + token)
      .send({ price: 50 })
      .expect(403, done);
  });
  it("[AUTH] DELETE /api/v1/adverts/:id of an ad that does not belong to the current user should return status 400", function (done) {
    request(app)
      .delete(`/api/v1/adverts/${idAdToTest}`)
      .set("Authorization", "Bearer " + token)
      .expect(403, done);
  });
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
  it("[AUTH] DELETE /api/v1/adverts/:id of an ad that does not exist should return status 404", function (done) {
    request(app)
      .delete(`/api/v1/adverts/${idAdTemp}`)
      .set("Authorization", "Bearer " + token)
      .expect(404, done);
  });
});

describe("Users wrong operations", () => {
  const randomString = Math.random().toString(36).substring(7);
  const userToAdd = {
    username: randomString,
    email: `${randomString}@example.com`,
    password: "1234",
  };
  it("POST /api/auth/signup should return a json response with information of the user that has just registered", function (done) {
    request(app).post("/api/auth/signup").send(userToAdd).expect(201, done);
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
  it("[AUTH] PUT /api/auth/me trying to modify ads should return status 400", function (done) {
    request(app)
      .put(`/api/auth/me`)
      .send({ ads: [] })
      .set("Authorization", "Bearer " + token)
      .expect(400, done);
  });
  it("[AUTH] PUT /api/auth/me/fav adding id without body or query", function (done) {
    request(app)
      .put(`/api/auth/me/fav`)
      .set("Authorization", "Bearer " + token)
      .expect(400, done);
  });
  it("[AUTH] PUT /api/auth/me/fav?action=add adding id of ad that does not exist to fav list", function (done) {
    request(app)
      .put(`/api/auth/me/fav?action=add`)
      .send({ idAdFav: idAdTemp })
      .set("Authorization", "Bearer " + token)
      .expect(400, done);
  });
  it("[AUTH] PUT /api/auth/me/fav?action=delete adding id of ad that does not exist to fav list", function (done) {
    request(app)
      .put(`/api/auth/me/fav?action=delete`)
      .send({ idAdFav: idAdTemp })
      .set("Authorization", "Bearer " + token)
      .expect(400, done);
  });
  it("DELETE /api/auth/me of an existing user should return 200", function (done) {
    request(app)
      .delete("/api/auth/me")
      .set("Authorization", "Bearer " + token)
      .expect(204, done);
  });
});
