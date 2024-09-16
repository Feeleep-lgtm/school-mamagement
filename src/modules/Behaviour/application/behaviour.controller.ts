import { Router } from "express";
import { Behaviour } from "../services/behaviour.service";
import { AuthMiddleware } from "../../../middlewares/auth/authToken";
import { validate } from "express-validation";
import {
  createBehaviorsValidation,
  editBehaviorsValidation,
  filterEditsBehaviourValidation,
} from "./validations";

export class BehaviourRoutes {
  private router: Router;
  private auth = new AuthMiddleware();
  private behaviours = new Behaviour();

  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes() {
    this.createBehaviourRoute();
    this.updateExistingAddBehaviourRoute();
    this.filterEditBehavioursRoute();
    this.viewBehaviourRoute();
  }

  private createBehaviourRoute() {
    this.router.post(
      "/behaviours/:schoolId",
      this.auth.Auth,
      validate(createBehaviorsValidation),
      this.auth.schoolAuth,
      this.behaviours.createBehaviour
    );
  }

  private updateExistingAddBehaviourRoute() {
    this.router.patch(
      "/behaviours/:schoolId",
      this.auth.Auth,
      validate(editBehaviorsValidation),
      this.auth.schoolAuth,
      this.behaviours.updateExistingAddBehaviour
    );
  }

  private filterEditBehavioursRoute() {
    this.router.get(
      "/filter-edits-behaviours/:schoolId",
      this.auth.Auth,
      validate(filterEditsBehaviourValidation),
      this.auth.schoolAuth,
      this.behaviours.filterEditBehaviours
    );
  }

  private viewBehaviourRoute() {
    this.router.get(
      "/view-student-behaviours/:schoolId",
      this.auth.Auth,
      this.auth.schoolAuth,
      this.behaviours.viewBehaviour
    );
  }

  public getRouters(): Router {
    return this.router;
  }
}
