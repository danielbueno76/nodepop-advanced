"use strict";

require("dotenv").config();

const request = require("supertest");
const app = require("../app");

describe("Authentication", () => {
  let token = "";

  it("POST /api/authenticate should return a json response with a token JWT and status 200", function (done) {
    request(app)
      .post("/api/authenticate")
      .send({
        email: "user@example.com",
        password: "1234",
      })
      .expect(200)
      .end((err, res) => {
        token = res.body.token;
        done();
      });
  });

  it("[AUTH] GET /api/advertisement?token=token should return status 200 and JSON", function (done) {
    request(app).get(`/api/advertisement?token=${token}`).expect(200, done);
  });
});
