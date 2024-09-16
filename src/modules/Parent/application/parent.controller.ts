import { Router } from "express";
import { AuthMiddleware } from "../../../middlewares/auth/authToken";
import { ParentAuthService } from "../services/parent.auth.service";
import { validate } from "express-validation";
import {
  onboardingValidation,
  parentEmailPasswordVerification,
  parentIdValidation,
  requestTokenValidation,
  resetPasswordValidation,
  tokenVerification,
  viewResultValidation,
} from "./validation";
import { StudentService } from "../../Students/services/student.service";
import {
  createStudentValidation,
  updateStudentValidation,
} from "../../Students/application/validations";
import { ParentManagement } from "../services/parent.management.service";
import { AdminParentStory } from "../../GuidentAdmin/services/admin.parentStory.service";
import { ParentResult } from "../services/parent.result.service";

export class ParentControllers {
  private auth = new AuthMiddleware();
  private authService = new ParentAuthService();
  private student = new StudentService();
  private parentStory = new AdminParentStory();
  private management = new ParentManagement();
  private parentResult = new ParentResult();
  private router: Router;
  constructor() {
    this.router = Router();
    this.initRoutes();
    this.initManageRoutes();
    this.initParentStudentDashboardRoutes();
  }
  private initRoutes() {
    this.authRoutes();
  }
  private authRoutes() {
    this.router.post(
      "/auth/signup",
      validate(parentEmailPasswordVerification),
      this.authService.signup
    );
    this.router.patch(
      "/auth/verify-email",
      validate(tokenVerification),
      this.authService.verifyEmailAccount
    );
    this.router.post(
      "/auth/request-otp",
      validate(requestTokenValidation),
      this.authService.requestOtp
    );
    this.router.patch(
      "/auth/reset-password",
      validate(resetPasswordValidation),
      this.authService.updatePassword
    );
    this.router.post(
      "/auth/login",
      validate(parentEmailPasswordVerification),
      this.authService.login
    );
    this.router.patch(
      "/auth/onboarding/:parentId",
      this.auth.Auth,
      validate(onboardingValidation),
      this.authService.onboarding
    );
  }

  private initParentStudentDashboardRoutes() {
    this.router.get(
      "/:parentId/dashboard/results",
      this.auth.Auth,
      this.auth.parentAuth,
      this.parentResult.parentStudentsDashboardResults
    );
    this.router.get(
      "/:parentId/results/view-result",
      this.auth.Auth,
      validate(viewResultValidation),
      this.auth.parentAuth,
      this.parentResult.viewStudentResult
    );
    this.router.get(
      "/:parentId/dashboard/behaviours",
      this.auth.Auth,
      this.auth.parentAuth,
      this.parentResult.parentStudentsDashboardBehaviours
    );
    this.router.get(
      "/:parentId/dashboard/skills",
      this.auth.Auth,
      this.auth.parentAuth,
      this.parentResult.parentStudentsDashboardSkills
    );
    this.router.get(
      "/:parentId/results/approved-results/:studentId",
      this.auth.Auth,
      this.auth.parentAuth,
      this.parentResult.fetchApprovedResults
    );
  }

  private initManageRoutes() {
    this.router.post(
      "/management/:parentId/create-student-account",
      this.auth.Auth,
      this.auth.parentAuth,
      validate(createStudentValidation),
      this.student.createStudent
    );
    this.router.put(
      "/:parentId/management/students/:studentId",
      this.auth.Auth,
      this.auth.parentAuth,
      validate(updateStudentValidation),
      this.student.updateStudent
    );
    this.router.patch(
      "/:parentId/management/upload-profile-picture/:studentId",
      this.auth.Auth,
      this.auth.parentAuth,
      this.student.getMulter().single("image"),
      this.student.uploadStudentProfilePicture
    );
    this.router.get(
      "/management/:parentId",
      validate(parentIdValidation),
      this.auth.Auth,
      this.auth.parentAuth,
      this.management.parentStudentSchoolDetails
    );
    this.router.get(
      "/:parentId/stories",
      this.auth.Auth,
      this.auth.parentAuth,
      this.parentStory.stories
    );
    this.router.get(
      "/:parentId/stories/:storyId",
      this.auth.Auth,
      this.auth.parentAuth,
      this.parentStory.story
    );
    this.router.delete(
      "/:parentId/management/delete-account",
      this.auth.Auth,
      this.auth.parentAuth,
      this.management.deactivateAccount
    )
  }

  getRouters() {
    return this.router;
  }
}
