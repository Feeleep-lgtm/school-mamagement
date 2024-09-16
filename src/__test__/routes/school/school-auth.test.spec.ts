import request from "supertest";
import { app } from "../../../app";

describe("POST /auth/login", () => {
  it("School auth test1: Should return 200 status code and login credentials", async () => {
    const res = await request(app)
      .post("/api/v2/school/auth/login")
      .send({ email: "olatunjijohn@yopmail.com", password: "123456789" })
      .set("Accept", "application/json");
    expect(res.body.message).toBe("Login successfully");
    expect(res.body.schoolCredentials).toBeDefined();
    expect(typeof res.body.schoolCredentials.token).toBe("string");
    expect(typeof res.body.schoolCredentials.schoolUserId).toBe("string");
    expect(typeof res.body.schoolCredentials.isProfileCompleted).toBe("boolean");
    expect(res.statusCode).toEqual(200);
  });
  it("School auth test2: Should return 400 and invalid error message", async () => {
    const res = await request(app)
      .post("/api/v2/school/auth/login")
      .send({ email: "olatunjijohn@yopmail.com", password: "12345678" })
      .set("Accept", "application/json");
    expect(res.body.message).toBe("Invalid password");
    expect(res.statusCode).toEqual(400);
  });
  it("School auth test2: Should return 400 and invalid error message", async () => {
    const res = await request(app)
      .post("/api/v2/school/auth/login")
      .send({ email: "olatunjijohn@yopmail.com", password: "12345678" })
      .set("Accept", "application/json");
    expect(res.body.message).toBe("Invalid password");
    expect(res.statusCode).toEqual(400);
  });
  it("School auth test2: Should return 404 and User does not exist", async () => {
    const res = await request(app)
      .post("/api/v2/school/auth/login")
      .send({ email: "userdoesnotexists@yopmail.com", password: "12345678" })
      .set("Accept", "application/json");
    expect(res.body.message).toBe("User does not exist");
    expect(res.statusCode).toEqual(404);
  });
});
