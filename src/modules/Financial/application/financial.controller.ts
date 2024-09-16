import { Router } from "express";
import { FinancialServices } from "../services/financial.service";
import { AuthMiddleware } from "../../../middlewares/auth/authToken";
import { validate } from "express-validation";
import {
  fetchFeeTypeBySessionAndTermValidation,
  fetchFinancialHistoriesTermValidation,
  setFeeTypeValidation,
  updateFeeTypeValidation,
} from "./validation";

export class FinancialRoutes {
  private router: Router;
  private financialRoute = new FinancialServices();
  private auth = new AuthMiddleware();
  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes() {
    this.router.post(
      "/:schoolId/set-fee",
      this.auth.Auth,
      validate(setFeeTypeValidation),
      this.auth.schoolAuth,
      this.financialRoute.setFeeType
    );
    this.router.get(
      "/:schoolId/fetch-fee-by-session-term-class",
      this.auth.Auth,
      validate(fetchFeeTypeBySessionAndTermValidation),
      this.auth.schoolAuth,
      this.financialRoute.fetchFeeBySessionTermClass
    );
    this.router.patch(
      "/:schoolId/update-fee-by-session-term",
      this.auth.Auth,
      validate(updateFeeTypeValidation),
      this.auth.schoolAuth,
      this.financialRoute.updateFeeBySessionTerm
    );
    this.router.post(
      "/:schoolId/make-payment",
      this.auth.Auth,
      this.auth.schoolAuth,
      this.financialRoute.makePayment
    );
    this.router.get(
      "/:schoolId/fetch-payment-histories",
      this.auth.Auth,
      validate(fetchFinancialHistoriesTermValidation),
      this.auth.schoolAuth,
      this.financialRoute.fetchPaymentHistory
    );
    this.router.get(
      "/:schoolId/student-payment-history",
      this.auth.Auth,
      this.auth.schoolAuth,
      this.financialRoute.studentPaymentHistory
    );
  }

  public getRouters() {
    return this.router;
  }
}
