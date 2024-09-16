import { Joi } from "express-validation";


export const emailValidation = {
  body: Joi.object({
    email: Joi.string().email().required(),
  }),
};