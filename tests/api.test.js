"use strict";

require("dotenv").config();

const request = require("supertest");
const app = require("../app");

describe("Authentication", () => {
  let token = "";

  it("POST /api/auth/login should return a json response with a token JWT and status 200", function (done) {
    request(app)
      .post("/api/auth/login")
      .send({
        email: "user@example.com",
        password: "1234",
      })
      .expect(200)
      .end((err, res) => {
        token = res.body.accessToken;
        done();
      });
  });

  it("[AUTH] GET /api/v1/adverts?token=token should return status 200 and JSON", function (done) {
    request(app).get(`/api/v1/adverts?token=${token}`).expect(200, done);
  });
});
