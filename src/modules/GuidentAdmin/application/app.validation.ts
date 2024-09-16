import { Joi } from "express-validation";

export const createStoryValidation = {
  body: Joi.object({
    title: Joi.string().required(),
    context: Joi.string().required(),
    content: Joi.string().required(),
    minuteRead: Joi.string().required(),
  }),
  params: Joi.object({
    guidentAdminId: Joi.string().uuid().required(),
  }),
};

export const updateStoryValidation = {
  body: Joi.object({
    title: Joi.string().required(),
    context: Joi.string().required(),
    content: Joi.string().required(),
    minuteRead: Joi.string().required(),
  }),
  params: Joi.object({
    guidentAdminId: Joi.string().uuid().required(),
    storyId: Joi.string().uuid().required(),
  }),
};

export const storyIdValidation = {
  params: Joi.object({
    guidentAdminId: Joi.string().uuid().required(),
    storyId: Joi.string().uuid().required(),
  }),
};

export const guidentAdminIdValidation = {
  params: Joi.object({
    guidentAdminId: Joi.string().uuid().required(),
  }),
};

export const createParentOnboardingValidation = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    occupation: Joi.string().required(),
    fullName: Joi.string().required(),
    parentPhoneNumber: Joi.string(),
    parentAddress: Joi.string(),
  }),
};
