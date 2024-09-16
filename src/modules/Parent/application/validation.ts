import { Joi } from "express-validation";

export const parentEmailPasswordVerification = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }),
};

export const tokenVerification = {
  body: Joi.object({
    email: Joi.string().email().required(),
    token: Joi.string().required(),
  }),
};

export const resetPasswordValidation = {
  body: Joi.object({
    email: Joi.string().email().required(),
    token: Joi.string().required(),
    password: Joi.string().min(8).required(),
  }),
};

export const requestTokenValidation = {
  body: Joi.object({
    email: Joi.string().email().required(),
  }),
};

export const onboardingValidation = {
  body: Joi.object({
    occupation: Joi.string().required(),
    fullName: Joi.string().required(),
    parentPhoneNumber: Joi.string(),
    parentAddress: Joi.string(),
  }),
};

export const parentIdValidation = {
  params: Joi.object({
    parentId: Joi.string().required(),
  }),
};

export const viewResultValidation = {
  query: Joi.object({
    classId: Joi.string().required(),
    academicSessionId: Joi.string().uuid().required(),
    academicSessionTermId: Joi.string().uuid().required(),
    studentAcademicSessionId: Joi.string().uuid().required(),
    schoolUserId: Joi.string().uuid().required(),
  }),
  params: Joi.object({
    parentId: Joi.string().uuid().required(),
  }),
};
