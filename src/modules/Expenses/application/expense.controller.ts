import { Router } from "express";
import { ExpenseServices } from "../services/expenses.service";
import { AuthMiddleware } from "../../../middlewares/auth/authToken";
import { validate } from "express-validation";
import {
    expenseValidation,
    fetchExpenseCategoryValidation,
    fetchExpenseVendorValidation,
    updateExpenseCategoryValidation,
    updateExpenseVendorValidation,
    setExpenseCategoryValidation,
    setExpenseVendorValidation,
    fetchExpenseValidation,
    fetchAnExpenseValidation
} from "./validation"

export class ExpenseRoutes {
  private router: Router;
  private ExpenseRoute = new ExpenseServices;
  private auth = new AuthMiddleware();
  constructor() {
    this.router = Router();
    this.initRoutes();
  }
  private initRoutes() {
    this.router.post(
      "/:schoolId/set-vendor",
      this.auth.Auth,
      validate(setExpenseVendorValidation),
      this.auth.schoolAuth,
      this.ExpenseRoute.setExpenseVendor
    );
    this.router.post(
      "/:schoolId/set-category",
      this.auth.Auth,
      validate(setExpenseCategoryValidation),
      this.auth.schoolAuth,
      this.ExpenseRoute.setExpenseCategory
    );
    this.router.post(
      "/:schoolId/expense",
      this.auth.Auth,
      validate(expenseValidation),
      this.auth.schoolAuth,
      this.ExpenseRoute.expense
    );
    this.router.get(
      "/:schoolId/fetch-vendor",
      this.auth.Auth,
      validate(fetchExpenseVendorValidation),
      this.auth.schoolAuth,
      this.ExpenseRoute.fetchExpenseVendor
    )
    this.router.get(
      "/:schoolId/fetch-category",
      this.auth.Auth,
      validate(fetchExpenseCategoryValidation),
      this.auth.schoolAuth,
      this.ExpenseRoute.fetchExpenseCategory
    )
    this.router.get(
        "/:schoolId/fetch-expenses",
        this.auth.Auth,
        validate(fetchExpenseValidation),
        this.auth.schoolAuth,
        this.ExpenseRoute.fetchExpenses
    )
    this.router.get(
      "/:schoolId/fetch-expense",
      this.auth.Auth,
      validate(fetchAnExpenseValidation),
      this.auth.schoolAuth,
      this.ExpenseRoute.fetchAnExpense
    )
    this.router.get(
      "/:schoolId/update-vendor",
      this.auth.Auth,
      validate(updateExpenseVendorValidation),
      this.auth.schoolAuth,
      this.ExpenseRoute.updateVendor
    )
    this.router.get(
      "/:schoolId/update-category",
      this.auth.Auth,
      validate(updateExpenseCategoryValidation),
      this.auth.schoolAuth,
      this.ExpenseRoute.updateCategory
    )

  }
  
  
  





    

    public getRouters() {
      return this.router;
    }
}