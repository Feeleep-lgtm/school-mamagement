import { Router } from "express";
import { validate } from "express-validation";
import { AdminParentStory } from "../services/admin.parentStory.service";
import { AdminAuth } from "../Auth/admin.auth";
import {
  createParentOnboardingValidation,
  createStoryValidation,
  guidentAdminIdValidation,
  storyIdValidation,
  updateStoryValidation,
} from "./app.validation";
import { AdminBackDoorRegistration } from "../services/admin.backdoor.registration.service";

export class GuidentAdminRoutes {
  private router: Router;
  private parentStory = new AdminParentStory();
  private adminBackDoorRegistration = new AdminBackDoorRegistration();
  private adminAuth = new AdminAuth();
  constructor() {
    this.router = Router();
    this.initRoutes();
    this.AdminBackDoorRegistration();
  }
  private initRoutes() {
    this.AdminParentStoryRoutes();
    this.AdminAuthRoutes();
  }

  private AdminParentStoryRoutes() {
    this.router.post(
      "/:guidentAdminId/stories",
      validate(createStoryValidation),
      this.parentStory.createStory
    );
    this.router.get(
      "/:guidentAdminId/stories",
      validate(guidentAdminIdValidation),
      this.parentStory.stories
    );
    this.router.get(
      "/:guidentAdminId/stories/:storyId",
      validate(storyIdValidation),
      this.parentStory.story
    );
    this.router.delete(
      "/:guidentAdminId/stories/:storyId",
      validate(storyIdValidation),
      this.parentStory.deleteStory
    );
    this.router.patch(
      "/:guidentAdminId/stories/:storyId",
      validate(updateStoryValidation),
      this.parentStory.updateStory
    );
  }

  private AdminAuthRoutes() {
    this.router.get("/", this.adminAuth.admin);
  }

  private AdminBackDoorRegistration = () => {
    this.router.post(
      "/:guidentAdminId/parent-back-door-registration",
      validate(createParentOnboardingValidation),
      this.adminBackDoorRegistration.createParentBackdoorAccount
    );
  };

  public getRouters() {
    return this.router;
  }
}
