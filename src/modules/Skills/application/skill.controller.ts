import { Router } from "express";
import { Skills } from "../services/skill.service";
import { validate } from "express-validation";
import { createSkillValidation, editSkillsValidation, filterEditsSkillsValidation } from "./validations";
import { AuthMiddleware } from "../../../middlewares/auth/authToken";

export class SkillsRoutes {
  private router: Router;
  private skills: Skills;
  private auth = new AuthMiddleware();
  constructor() {
    this.router = Router();
    this.skills = new Skills();
    this.initRoutes();
  }
  private initRoutes() {
    this.createSkillsRoute();
    this.updateSkillsRoute();
    this.filterSkillsRoute();
  }
  private createSkillsRoute() {
    this.router.post(
      "/skills/:schoolId",
      this.auth.Auth,
      validate(createSkillValidation),
      this.auth.schoolAuth,
      this.skills.createSkills
    );
  }
  private updateSkillsRoute() {
    this.router.patch(
      "/skills/:schoolId",
      this.auth.Auth,
      validate(editSkillsValidation),
      this.auth.schoolAuth,
      this.skills.updateExistingAddSKills
    );
  }
  private filterSkillsRoute() {
    this.router.get(
      "/filter-edit-skills/:schoolId",
      this.auth.Auth,
      validate(filterEditsSkillsValidation),
      this.auth.schoolAuth,
      this.skills.filterSkills
    );
  }
  public getRouters() {
    return this.router;
  }
}
