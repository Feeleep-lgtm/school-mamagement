import { Joi } from "express-validation";

export const createBehaviorsValidation = {
  body: Joi.object({
    classId: Joi.string().uuid().required(),
    academicSessionId: Joi.string().uuid().required(),
    academicSessionTermId: Joi.string().uuid().required(),
    behaviourType: Joi.string().required(),
    records: Joi.array().items(
      Joi.object({
        score: Joi.number().required(),
        studentAcademicSessionId: Joi.string().required(),
      })
    ),
  }),
  params: Joi.object({
    schoolId: Joi.string().uuid().required(),
  }),
};

export const editBehaviorsValidation = {
  body: Joi.object({
    records: Joi.array().items(
      Joi.object({
        score: Joi.number().required(),
        behaviourId: Joi.string().required(),
      })
    ),
  }),
  params: Joi.object({
    schoolId: Joi.string().uuid().required(),
  }),
};

export const filterEditsBehaviourValidation = {
  query: Joi.object({
    classId: Joi.string().uuid().required(),
    academicSessionId: Joi.string().uuid().required(),
    academicSessionTermId: Joi.string().uuid().required(),
    behaviourType: Joi.string().required(),
  }),
  params: Joi.object({
    schoolId: Joi.string().uuid().required(),
  }),
};
