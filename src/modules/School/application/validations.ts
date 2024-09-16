import { Joi } from "express-validation";

export const createSchoolValidation = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }),
};
export const requestTokenValidation = {
  body: Joi.object({
    email: Joi.string().email().required(),
  }),
};
export const tokenVerification = {
  body: Joi.object({
    email: Joi.string().email().required(),
    token: Joi.string().required(),
  }),
};

export const updatePasswordVerification = {
  body: Joi.object({
    email: Joi.string().email().required(),
    token: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

export const completeShoolProfileValidation = {
  body: Joi.object({
    schoolName: Joi.string().required(),
    schoolAddress: Joi.string().required(),
    rcNumber: Joi.number().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    adminPosition: Joi.string().required(),
  }),
  params: Joi.object({
    schoolId: Joi.string().uuid().required(),
  }),
};
export const updateClassQueryValidation = {
  query: Joi.object({
    classId: Joi.string().required(),
  }),
  params: Joi.object({
    schoolId: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    className: Joi.string().required(),
  }),
};
export const subjectValidation = {
  query: Joi.object({
    classId: Joi.string().required(),
  }),
  params: Joi.object({
    schoolId: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    subject: Joi.string().required(),
  }),
};
export const deleteSubjectValidation = {
  query: Joi.object({
    classId: Joi.string().required(),
    subjectId: Joi.string().required(),
  }),
  params: Joi.object({
    schoolId: Joi.string().uuid().required(),
  }),
};
export const createClassValidation = {
  body: Joi.object({
    className: Joi.string().required(),
  }),
  params: Joi.object({
    schoolId: Joi.string().uuid().required(),
  }),
};

export const searchStudentValidation = {
  body: Joi.object({
    studentIdentity: Joi.string().required(),
  }),
  params: Joi.object({
    schoolId: Joi.string().uuid().required(),
  }),
};

export const searchParentValidation = {
  body: Joi.object({
    parentIdentity: Joi.string().required(),
  }),
};

export const admitStudentValidation = {
  body: Joi.object({
    studentId: Joi.string().required(),
    academicSessionId: Joi.string().required(),
    academicSessionTermId: Joi.string().required(),
    classId: Joi.string().required(),
  }),
  params: Joi.object({
    schoolId: Joi.string().uuid().required(),
  }),
};

export const createRemarksValidation = {
  body: Joi.object({
    studentAcademicSessionId: Joi.string().uuid().required(),
    academicSessionId: Joi.string().uuid().required(),
    academicSessionTermId: Joi.string().uuid().required(),
    classId: Joi.string().uuid().required(),
    comment: Joi.string().required(),
    remarkType: Joi.string().required(),
  }),
  params: Joi.object({
    schoolId: Joi.string().uuid().required(),
  }),
};

export const createAcademicSessionAssessmentValidation = {
  body: Joi.object({
    grade: Joi.number().required(),
    assessmentName: Joi.string().required(),
  }),
  params: Joi.object({
    schoolId: Joi.string().uuid().required(),
    academicSessionId: Joi.string().uuid().required(),
  }),
};

export const updateAcademicSessionAssessmentValidation = {
  body: Joi.object({
    grade: Joi.number().required(),
    assessmentName: Joi.string().required(),
  }),
  params: Joi.object({
    schoolId: Joi.string().uuid().required(),
  }),
  query: Joi.object({
    assessmentId: Joi.string().required(),
  }),
};

export const uploadResultValidation = {
  body: Joi.object({
    subjectId: Joi.string().required(),
    assessmentId: Joi.string().required(),
    classId: Joi.string().required(),
    academicSessionId: Joi.string().required(),
    academicSessionTermId: Joi.string().required(),
    resultType: Joi.string().required(),
    records: Joi.array().items(
      Joi.object({
        score: Joi.number().required(),
        commentaryScore: Joi.string(),
        studentAcademicSessionId: Joi.string().required(),
      })
    ),
  }),
  params: Joi.object({
    schoolId: Joi.string().uuid().required(),
  }),
};

export const approveResultToParentsValidation = {
  body: Joi.object({
    classId: Joi.string().required(),
    academicSessionId: Joi.string().required(),
    academicSessionTermId: Joi.string().required(),
    studentAcademicSessionIds: Joi.array().items(
      Joi.object({
        studentAcademicSessionId: Joi.string().required(),
      })
    ),
  }),
  params: Joi.object({
    schoolId: Joi.string().uuid().required(),
  }),
};

export const editResultValidation = {
  body: Joi.object({
    records: Joi.array().items(
      Joi.object({
        score: Joi.number().required(),
        resultId: Joi.string().uuid().required(),
      })
    ),
    assessmentId: Joi.string().uuid().required(),
  }),
  params: Joi.object({
    schoolId: Joi.string().uuid().required(),
  }),
};

export const viewResultValidation = {
  query: Joi.object({
    classId: Joi.string().required(),
    academicSessionId: Joi.string().uuid().required(),
    academicSessionTermId: Joi.string().uuid().required(),
    studentAcademicSessionId: Joi.string().uuid().required(),
  }),
  params: Joi.object({
    schoolId: Joi.string().uuid().required(),
  }),
};

export const filterEditsResultValidation = {
  query: Joi.object({
    assessmentId: Joi.string().uuid().required(),
    classId: Joi.string().uuid().required(),
    academicSessionId: Joi.string().uuid().required(),
    academicSessionTermId: Joi.string().uuid().required(),
    subjectId: Joi.string().uuid().required(),
  }),
  params: Joi.object({
    schoolId: Joi.string().uuid().required(),
  }),
};

export const filterAcademicTermClassValidation = {
  query: Joi.object({
    classId: Joi.string().uuid().required(),
    academicSessionId: Joi.string().uuid().required(),
    academicSessionTermId: Joi.string().uuid().required(),
  }),
  params: Joi.object({
    schoolId: Joi.string().uuid().required(),
  }),
};

export const createAttendanceValidation = {
  body: Joi.object({
    totalDays: Joi.number().required(),
    absentDays: Joi.number().required(),
    presentDays: Joi.number().required(),
    studentAcademicSessionId: Joi.string().uuid().required(),
    classId: Joi.string().uuid().required(),
    academicSessionId: Joi.string().uuid().required(),
    academicSessionTermId: Joi.string().uuid().required(),
  }),
  params: Joi.object({
    schoolId: Joi.string().uuid().required(),
  }),
};

export const promoteStudentValidation = {
  body: Joi.object({
    studentCurrentPositionInfo: Joi.object({
      currentSessionPeriodId: Joi.string().uuid().required(),
      currentClassId: Joi.string().uuid().required(),
      currentTermId: Joi.string().uuid().required(),
      studentIds: Joi.array().items(
        Joi.object({
          studentId: Joi.string().uuid().required(),
        })
      ),
    }),
    newPositionData: Joi.object({
      newSessionPeriodId: Joi.string().uuid().required(),
      newClassId: Joi.string().uuid().required(),
      newTermId: Joi.string().uuid().required(),
    }),
  }),
};
