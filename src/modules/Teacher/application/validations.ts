import { Joi } from "express-validation";


export const emailPasswordValidation = {
    body: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
    }),
};
export const verifyEmailValidation = {
    body: Joi.object({
        email: Joi.string().email().required(),
    }),
};
export const tokenVerification = {
    body: Joi.object({
        email: Joi.string().email().required(),
        token: Joi.string().required()
    }),
};
export const updatePasswordVerification = {
    body: Joi.object({
        email: Joi.string().email().required(),
        token: Joi.string().required(),
        password: Joi.string().required()
    }),
};

export const onboardingValidation = {
    body: Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        address: Joi.string().required(),
        phoneNumber: Joi.string().required()
    }),
};
