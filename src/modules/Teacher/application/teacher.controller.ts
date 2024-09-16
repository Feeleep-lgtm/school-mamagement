import { Router } from "express";
import { TeacherAuthService } from "../services/teacher.auth.service";
import { validate } from "express-validation";
import {
  emailPasswordValidation,
  onboardingValidation,
  tokenVerification,
  updatePasswordVerification,
  verifyEmailValidation,
} from "./validations";
import { AuthMiddleware } from "../../../middlewares/auth/authToken";
import { UploadTeacherService } from "../services/teacher.uploads.service";

export class TeacherRoutes {
  private router: Router;
  private authService = new TeacherAuthService();
  private auth = new AuthMiddleware();
  private upload = new UploadTeacherService();
  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes() {
    this.signup();
    this.login();
    this.requestOtp();
    this.verifyEmail();
    this.onboarding();
    this.initUploadTeacherProfilePicture();
    this.initDeleteTeacherProfilePicture();
    this.forgetPassword();
    this.resetPassword()
  }

  private signup() {
    this.router.post("/auth/signup", validate(emailPasswordValidation), this.authService.signup);
  }
  private login() {
    this.router.post("/auth/login", validate(emailPasswordValidation), this.authService.login);
  }
  private requestOtp() {
    this.router.post(
      "/auth/request-token",
      validate(verifyEmailValidation),
      this.authService.requestToken
    );
  }
  private onboarding() {
    this.router.post(
      "/auth/onboarding/:teacherId",
      this.auth.Auth,
      this.auth.teacherAuth,
      validate(onboardingValidation),
      this.authService.onboarding
    );
  }
  private verifyEmail() {
    this.router.post(
      "/auth/verify-email",
      validate(tokenVerification),
      this.authService.verifyEmail
    );
  }
  private initUploadTeacherProfilePicture() {
    this.router.post(
      "/auth/profile/:teacherId",
      this.auth.Auth,
      this.auth.teacherAuth,
      this.upload.getMulter().single("image"),
      this.upload.uploadProfilePicture
    );
  }
  private initDeleteTeacherProfilePicture() {
    this.router.delete(
      "/auth/profile/:teacherId",
      this.auth.Auth,
      this.auth.teacherAuth,
      this.upload.deleteProfilePicture
    );
  }

  private forgetPassword() {
    this.router.post(
      "/auth/forget-password",
      validate(verifyEmailValidation),
      this.authService.forgetPassword
    );
  }
  private resetPassword() {
    this.router.patch(
      "/auth/reset-password",
      validate(updatePasswordVerification),
      this.authService.resetPassword
    );
  }
  public getRoutes() {
    return this.router;
  }
}
