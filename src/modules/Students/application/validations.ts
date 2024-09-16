import { Joi } from "express-validation";

export const createStudentValidation = {
  body: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    otherName: Joi.string(),
    nationality: Joi.string().required(),
    dateOfBirth: Joi.string().required(),
    stateOfOrigin: Joi.string().required(),
    localGovernmentArea: Joi.string(),
    secure_url: Joi.string().required(),
    public_id: Joi.string().required(),
    email: Joi.string().required(),
  }),
};



export const updateStudentValidation = {
  body: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    otherName: Joi.string(),
    nationality: Joi.string().required(),
    dateOfBirth: Joi.string().required(),
    stateOfOrigin: Joi.string().required(),
    localGovernmentArea: Joi.string(),
  }),
};
