
import { Joi } from "express-validation";

export const setExpenseCategoryValidation = {
    body: Joi.object({
        name: Joi.string().required(),
    }),
    params: Joi.object({
        schoolId: Joi.string().uuid().required(),
    }),
}

export const setExpenseVendorValidation = {
    body: Joi.object({
        name: Joi.string().required(),
    }),
    params: Joi.object({
        schoolId: Joi.string().uuid().required(),
}),
}

export const updateExpenseCategoryValidation = {
    body: Joi.object({
        expenseCategoryId: Joi.string().uuid().required(),
        name: Joi.string().required(),
    }),
    params: Joi.object({
        schoolId: Joi.string().uuid().required(),
      }),
}

export const updateExpenseVendorValidation = {
    body: Joi.object({
        expenseVendorId: Joi.string().uuid().required(),
        name: Joi.string().required(),
    }),
    params: Joi.object({
        schoolId: Joi.string().uuid().required(),
      }),
}

export const fetchExpenseVendorValidation = {
    params: Joi.object({
        schoolId: Joi.string().uuid().required(),
      }),
}

export const fetchExpenseCategoryValidation = {
    params: Joi.object({
        schoolId: Joi.string().uuid().required(),
      }),
}

export const expenseValidation = {
    body: Joi.object({
        academicSessionId: Joi.string().uuid().required(),
        academicSessionTermId: Joi.string().uuid().required(),
        receipt: Joi.string().required(),
        expenseCategoryId: Joi.string().required(),
        expenseVendorId: Joi.string().required(),
        paidAmount: Joi.number().required(),
        totalCostOfService: Joi.number().required(),
        description: Joi.string()
    })
}

export const fetchExpenseValidation = {
    body: Joi.object({
        academicSessionId: Joi.string().uuid(),
        academicSessionTermId: Joi.string().uuid(),
        vendorId: Joi.string().uuid(),
        categoryId: Joi.string().uuid(),

    }),
    params: Joi.object({
        schoolId: Joi.string().uuid().required(),
      }),
}

export const fetchAnExpenseValidation = {
    body: Joi.object({
        academicSessionId: Joi.string().uuid(),
        academicSessionTermId: Joi.string().uuid(),
        vendorId: Joi.string().uuid(),
        categoryId: Joi.string().uuid(),
    })
}