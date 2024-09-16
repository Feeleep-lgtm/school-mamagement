import { Joi } from "express-validation";

export const createAcademicSessionValidation = {
  body: Joi.object({
    sessionName: Joi.string()
      .required()
      .regex(/^20\d{2}\/20(0\d|1\d|2\d)$/i)
      .message(
        '"sessionName" must be in the format "20XX/20YY" where XX is a 4-digit year and YY is a year no more than 1 year ahead of XX.'
      )
      .custom((value, helpers) => {
        const [start, end] = value.split("/");
        const startYear = parseInt(start);
        const endYear = parseInt(end);
        if (endYear - startYear !== 1) {
          return helpers.error("any.invalid", {
            message: `Invalid sessionName value. The left year must be exactly 1 less than the right year.`,
          });
        }
        return value;
      }),
    sessionStartDate: Joi.date().required(),
    sessionEndDate: Joi.date().required(),
    termName: Joi.string().required(),
    termStartDate: Joi.date().required(),
    termEndDate: Joi.date().required(),
  }),
  params: Joi.object({
    schoolId: Joi.string().required(),
  }),
};

export const updateAcademicSessionValidation = {
  body: Joi.object({
    sessionName: Joi.string()
      .required()
      .regex(/^20\d{2}\/20(0\d|1\d|2\d)$/i)
      .message(
        '"sessionName" must be in the format "20XX/20YY" where XX is a 4-digit year and YY is a year no more than 1 year ahead of XX.'
      )
      .custom((value, helpers) => {
        const [start, end] = value.split("/");
        const startYear = parseInt(start);
        const endYear = parseInt(end);
        if (endYear - startYear !== 1) {
          return helpers.error("any.invalid", {
            message: `Invalid sessionName value. The left year must be exactly 1 less than the right year.`,
          });
        }
        return value;
      }),
    sessionStartDate: Joi.date(),
    sessionEndDate: Joi.date(),
  }),
  params: Joi.object({
    schoolId: Joi.string().required(),
    academicSessionId: Joi.string().required(),
  }),
};
