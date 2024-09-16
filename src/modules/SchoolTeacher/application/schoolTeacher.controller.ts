import { Router } from "express";
import { AuthMiddleware } from "../../../middlewares/auth/authToken";
import { SchoolTeacherInvitation } from "../services/invitation.service";
import { validate } from "express-validation";
import { emailValidation } from "./validations";

export class SchoolTeacherRoutes {
  private router: Router;
  private auth: AuthMiddleware;
  private invitation = new SchoolTeacherInvitation();
  constructor() {
    this.router = Router();
    this.auth = new AuthMiddleware();
    this.initRoutes();
  }

  private initRoutes() {
    this.inviteTeacher();
    this.acceptInvitation();
    this.invitations();
    this.deleteInvitation();
  }

  private inviteTeacher() {
    this.router.post(
      "/invitation/:schoolId",
      this.auth.Auth,
      this.auth.schoolAuth,
      validate(emailValidation),
      this.invitation.inviteTeacher
    );
  }
  private acceptInvitation() {
    this.router.patch(
      "/invitation/:teacherId/:schoolId",
      this.auth.Auth,
      this.auth.teacherAuth,
      this.invitation.acceptInvite
    );
  }
  private invitations() {
    this.router.get(
      "/invitations/:schoolId",
      this.auth.Auth,
      this.auth.schoolAuth,
      this.invitation.fetchInvitations
    );
  }
  private deleteInvitation() {
    this.router.delete(
      "/invitations/:schoolId/:teacherId",
      this.auth.Auth,
      this.auth.schoolAuth,
      this.invitation.deleteInvitation
    );
  }
  public getRouters() {
    return this.router;
  }
}
