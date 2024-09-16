import { Router } from "express";
import { AcademicSessionTermService } from "../services/term.service";
import { AuthMiddleware } from "../../../middlewares/auth/authToken";

export class AcademicSessionTermRoutes {
  private academicSessionTermService = new AcademicSessionTermService();
  private auth = new AuthMiddleware();

  private router: Router;

  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes() {
    this.createNewAcademicTerm();
    this.updateTerm();
    this.endAcademicTerm();
  }

  private createNewAcademicTerm() {
    this.router.post(
      "/term/:schoolId/:academicSessionId",
      this.auth.Auth,
      this.auth.schoolAuth,
      this.academicSessionTermService.createNewAcademicTerm
    );
  }

  private updateTerm() {
    this.router.patch(
      "/term/:schoolId/:academicSessionId/:termId",
      this.auth.Auth,
      this.auth.schoolAuth,
      this.academicSessionTermService.updateTerm
    );
  }

  private endAcademicTerm() {
    this.router.put(
      "/term/:schoolId/:academicSessionId/:termId",
      this.auth.Auth,
      this.auth.schoolAuth,
      this.academicSessionTermService.endAcademicTerm
    );
  }
  getRouters() {
    return this.router;
  }
}
