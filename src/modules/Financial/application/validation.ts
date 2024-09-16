import { Joi } from "express-validation";

export const setFeeTypeValidation = {
  body: Joi.object({
    academicSessionId: Joi.string().required(),
    academicSessionTermId: Joi.string().required(),
    feeAmount: Joi.string().required(),
    name: Joi.string().required(),
    classId: Joi.string().required()
  }),
  params: Joi.object({
    schoolId: Joi.string().uuid().required(),
  }),
};

export const updateFeeTypeValidation = {
  body: Joi.object({
    feeTypeId: Joi.string().uuid().required(),
    feeAmount: Joi.string().required(),
    name: Joi.string().required(),
  }),
  params: Joi.object({
    schoolId: Joi.string().uuid().required(),
  }),
};

export const fetchFeeTypeBySessionAndTermValidation = {
  query: Joi.object({
    academicSessionId: Joi.string().uuid().required(),
    academicSessionTermId: Joi.string().uuid().required(),
    classId: Joi.string().required(),
  }),
  params: Joi.object({
    schoolId: Joi.string().uuid().required(),
  }),
};

export const makePaymentValidation = {
  body: Joi.object({
    academicSessionId: Joi.string().uuid().required(),
    academicSessionTermId: Joi.string().uuid().required(),
    receipt: Joi.string().required(),
    classId: Joi.string().uuid().required(),
    studentAcademicSessionId: Joi.string().uuid().required(),
    amount: Joi.string().required(),
    paymentMethod: Joi.string().required(),
  }),
};

export const fetchFinancialHistoriesTermValidation = {
  query: Joi.object({
    academicSessionId: Joi.string().uuid(),
    academicSessionTermId: Joi.string().uuid(),
    classId: Joi.string().uuid(),
    feeTypeId: Joi.string().uuid(),
    status: Joi.string()
  }),
  params: Joi.object({
    schoolId: Joi.string().uuid().required(),
  }),
};
