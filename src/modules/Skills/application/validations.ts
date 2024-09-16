import { Joi } from "express-validation";

export const createSkillValidation = {
  body: Joi.object({
    classId: Joi.string().uuid().required(),
    academicSessionId: Joi.string().uuid().required(),
    academicSessionTermId: Joi.string().uuid().required(),
    skillType: Joi.string().required(),
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

export const editSkillsValidation = {
  body: Joi.object({
    records: Joi.array().items(
      Joi.object({
        score: Joi.number().required(),
        skillId: Joi.string().required(),
      })
    ),
  }),
  params: Joi.object({
    schoolId: Joi.string().uuid().required(),
  }),
};

export const filterEditsSkillsValidation = {
  query: Joi.object({
    classId: Joi.string().uuid().required(),
    academicSessionId: Joi.string().uuid().required(),
    academicSessionTermId: Joi.string().uuid().required(),
    skillType: Joi.string().required(),
  }),
  params: Joi.object({
    schoolId: Joi.string().uuid().required(),
  }),
};
