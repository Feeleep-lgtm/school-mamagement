import { Router } from "express";
import { AcademicSessionLogics } from "../services/academicSession.service";
import { validate } from "express-validation";
import { createAcademicSessionValidation, updateAcademicSessionValidation } from "./validations";
import { AuthMiddleware } from "../../../middlewares/auth/authToken";

interface AcademicSessionRoutesProps {
  academicSession: AcademicSessionLogics;
}

export class AcademicSessionRoutes implements AcademicSessionRoutesProps {
  academicSession = new AcademicSessionLogics();
  auth = new AuthMiddleware();
  router: Router;

  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes() {
    this.createAcademicSession();
    this.updateAcademicSession();
    this.endAcademicSession();
    this.getAcademicSessions();
    this.getAcademicSession()
  }

  private createAcademicSession() {
    this.router.post(
      "/academic-sessions/:schoolId",
      this.auth.Auth,
      this.auth.schoolAuth,
      validate(createAcademicSessionValidation),
      this.academicSession.createAcademicSession
    );
  }

  private updateAcademicSession() {
    this.router.patch(
      "/academic-sessions/:schoolId/:academicSessionId",
      this.auth.Auth,
      this.auth.schoolAuth,
      validate(updateAcademicSessionValidation),
      this.academicSession.updateAcademicSession
    );
  }

  private endAcademicSession() {
    this.router.put(
      "/academic-sessions/:schoolId/:academicSessionId",
      this.auth.Auth,
      this.auth.schoolAuth,
      this.academicSession.endAcademicSession
    );
  }

  private getAcademicSessions() {
    this.router.get(
      "/academic-sessions/:schoolId",
      this.auth.Auth,
      this.auth.schoolAuth,
      this.academicSession.getSchoolAcademicSessions
    );
  }

  private getAcademicSession() {
    this.router.get(
      "/academic-sessions/:schoolId/:academicSessionId",
      this.auth.Auth,
      this.auth.schoolAuth,
      this.academicSession.getSchoolAcademicSession
    );
  }

  getRouters() {
    return this.router;
  }
}
