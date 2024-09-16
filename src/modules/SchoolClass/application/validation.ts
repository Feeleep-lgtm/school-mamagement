import { Joi } from "express-validation";




export const createClassQueryValidation = {
    params: Joi.object({
        schoolId: Joi.string().required(),
    }),
    body: Joi.object({
        className: Joi.string().required(),
    }),
};

export const updateClassValidation = {
    query: Joi.object({
        classId: Joi.string().required(),
    }),
    params: Joi.object({
        schoolId: Joi.string().required(),
    }),
    body: Joi.object({
        className: Joi.string().required(),
    }),
};

export const createSubjectValidation = {
    query: Joi.object({
        classId: Joi.string().required(),
    }),
    params: Joi.object({
        schoolId: Joi.string().required(),
    }),
    body: Joi.object({
        subject:Joi.string().required(),
    }),
};

export const updateSubjectValidation = {
  params: Joi.object({
    schoolId: Joi.string().uuid().required(),
    classId: Joi.string().uuid().required(),
    subjectId: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    subject: Joi.string().required(),
  }),
};
