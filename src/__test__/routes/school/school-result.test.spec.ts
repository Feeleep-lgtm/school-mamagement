import request from "supertest";
import { app } from "../../../app";


describe("Results Tests", () => {
  it("Fetch single student results", async () => {
    const schoolUserId = "a25298ac-c779-4ef0-80e6-7c22332621a2";
    const academicSessionTermId = "25767697-2d92-41d8-b571-1f7061f80972";
    const classId = "1e2fc89b-2e82-46ef-9f53-efbb0fc44349";
    const academicSessionId = "da666002-80e9-4212-97ab-8f6d1d654740";
    const studentAcademicSessionId = "21acc702-5c69-4b03-b00a-f9b43702faac";
    const queryConcatenation = `${schoolUserId}?academicSessionTermId=${academicSessionTermId}&classId=${classId}&academicSessionId=${academicSessionId}&studentAcademicSessionId=${studentAcademicSessionId}`;
    const bearerToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoSWQiOiJhMjUyOThhYy1jNzc5LTRlZjAtODBlNi03YzIyMzMyNjIxYTIiLCJpYXQiOjE3MDE4NDU3NTIsImV4cCI6MTcwNDQzNzc1Mn0.gWq8_cmCAWLoCqVETSf5X4CPTL2eOYqyXBNhazdOhD4";
    const res = await request(app)
      .get(`/api/v2/school/results/student/${queryConcatenation}`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .set("Accept", "application/json");
    expect(res.body.message).toBe("Fetched successfully");
  });
});
