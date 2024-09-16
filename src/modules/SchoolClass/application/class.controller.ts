import { Router } from "express";
import { SchoolClass } from "../services/class.service";
import { SchoolClassSubject } from "../services/subject.service";
import { AuthMiddleware } from "../../../middlewares/auth/authToken";
import { validate } from "express-validation";
import {
  createClassQueryValidation,
  createSubjectValidation,
  updateClassValidation,
  updateSubjectValidation,
} from "./validation";

export class SchoolClassSubjectRoutes {
  private schoolClass = new SchoolClass();
  private schoolClassSubject = new SchoolClassSubject();
  private auth = new AuthMiddleware();
  private router: Router;

  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes() {
    this.createClassRoute();
    this.updateSchoolClass();
    this.getSchoolClasses();
    this.getSchoolClass();
    this.createClassSubject();
    this.updateClassSubject();
  }

  private createClassRoute() {
    this.router.post(
      "/class/:schoolId",
      validate(createClassQueryValidation),
      this.auth.Auth,
      this.auth.schoolAuth,
      this.schoolClass.createSchoolClass
    );
  }

  private updateSchoolClass() {
    this.router.patch(
      "/class/:schoolId",
      validate(updateClassValidation),
      this.auth.Auth,
      this.auth.schoolAuth,
      this.schoolClass.updateSchoolClass
    );
  }

  private getSchoolClasses() {
    this.router.get(
      "/class/:schoolId",
      this.auth.Auth,
      this.auth.schoolAuth,
      this.schoolClass.getSchoolClass
    );
  }

  private getSchoolClass() {
    this.router.get(
      "/classes/:schoolId",
      this.auth.Auth,
      this.auth.schoolAuth,
      this.schoolClass.getSchoolClasses
    );
  }

  private createClassSubject() {
    this.router.post(
      "/class/subject/:schoolId",
      validate(createSubjectValidation),
      this.auth.Auth,
      this.auth.schoolAuth,
      this.schoolClassSubject.createSubject
    );
  }

  private updateClassSubject() {
    this.router.patch(
      "/:schoolId/class/:classId/subjects/:subjectId",
      this.auth.Auth,
      this.auth.schoolAuth,
      validate(updateSubjectValidation),
      this.schoolClassSubject.updateClassSubject
    );
  }

  getRouters() {
    return this.router;
  }
}
