import { RequestHandler } from "express";
import prisma from "../../../database/PgDB";
import { UserRepository } from "../../../shared/repository/userRepository";
import { AcademicSessionModel } from "../../AcademicSession/application/academicSession.model";
import { StatusCodes } from "http-status-codes";
import { InternalServerError } from "../../../errors/InternalServerError";
import { BadRequestError, NotFoundError } from "../../../errors";

export class SchoolAcademicSessionAssessment {
  private userRepository = new UserRepository();
  private academicSession = new AcademicSessionModel();
  public createAcademicSessionAssessment: RequestHandler = async (req, res, next) => {
    try {
      const { assessmentName, grade } = req.body;
      const { academicSessionId } = req.params;
      const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
      await this.academicSession.findAcademicSessionById(academicSessionId);
      const isAssessmentExistingInAcademicSession = await prisma.assessment.findFirst({
        where: {
          assessmentName: assessmentName.toLowerCase(),
          academicSessionId: academicSessionId,
          schoolId: school.id,
        },
      });
      if (isAssessmentExistingInAcademicSession) {
        throw new BadRequestError("assessmentName already exits in the academic session");
      }
      const assessment = await prisma.assessment.create({
        data: {
          assessmentName: assessmentName.toLowerCase(),
          grade: grade,
          academicSessionId,
          schoolId: school.id,
        },
      });
      if (!assessment) {
        throw new InternalServerError("Failed to create assessment");
      }
      res.status(StatusCodes.CREATED).json({ message: "Created!", data: assessment });
    } catch (error) {
      next(error);
    }
  };

  public updateAcademicSessionAssessment: RequestHandler = async (req, res, next) => {
    try {
      const { assessmentName, grade } = req.body;
      const assessmentId = req.query.assessmentId as string;
      await this.academicSession.findAcademicSessionById(req.params.academicSessionId);
      const findAssessment = await prisma.assessment.findUnique({
        where: {
          id: assessmentId,
        },
      });
      if (!findAssessment) {
        throw new NotFoundError("Assessment not found");
      }
      let updatedAssessment;
      if (findAssessment.assessmentName === assessmentName.toLowerCase()) {
        updatedAssessment = await prisma.assessment.update({
          where: { id: assessmentId },
          data: {
            grade,
          },
        });
      } else {
        updatedAssessment = await prisma.assessment.update({
          where: { id: assessmentId },
          data: {
            assessmentName: assessmentName.toLowerCase(),
            grade,
          },
        });
      }
      res.status(StatusCodes.CREATED).json({ message: "Updated!", data: updatedAssessment });
    } catch (error) {
      next(error);
    }
  };

  public getAcademicSessionAssessments: RequestHandler = async (req, res, next) => {
    try {
      const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
      const assessments = await prisma.assessment.findMany({ where: { schoolId: school.id } });
      res.status(StatusCodes.CREATED).json({ message: "Fetched", data: assessments });
    } catch (error) {
      next(error);
    }
  };

  public getAcademicSessionAssessment: RequestHandler = async (req, res, next) => {
    try {
      const assessment = await prisma.assessment.findUnique({
        where: { id: req.params.assessmentId },
      });
      res.status(StatusCodes.CREATED).json({ message: "Fetched", data: assessment });
    } catch (error) {
      next(error);
    }
  };
}
