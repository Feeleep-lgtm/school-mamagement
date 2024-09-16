import request from "supertest";
import { app } from "../../../app";

describe("POST /auth/login", () => {
  it("Parent auth test1: Should return 200 status code and login credentials", async () => {
    const res = await request(app)
      .post("/api/v2/parent/auth/login")
      .send({ email: "olatunjiayomiku@yopmail.com", password: "12345678" })
      .set("Accept", "application/json");
    expect(res.body.message).toBe("Login successfully");
    expect(res.body.parentCredentials).toBeDefined();
    expect(typeof res.body.parentCredentials.token).toBe("string");
    expect(typeof res.body.parentCredentials.parentUserId).toBe("string");
    expect(typeof res.body.parentCredentials.isProfileCompleted).toBe("boolean");
    expect(res.statusCode).toEqual(200);
  });
  it("Parent auth test2: Should return 400 and invalid error message", async () => {
    const res = await request(app)
      .post("/api/v2/parent/auth/login")
      .send({ email: "olatunjiayomiku@yopmail.com", password: "123456789" })
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
