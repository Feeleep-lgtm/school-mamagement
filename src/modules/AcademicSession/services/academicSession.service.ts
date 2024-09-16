import { RequestHandler } from "express";
import prisma from "../../../database/PgDB";
import { AcademicSessionModel } from "../application/academicSession.model";
import { StatusCodes } from "http-status-codes";
import { throwError } from "../../../helpers/ControllerError";
import { SchoolClassSubjectModels } from "../../SchoolClass/application/class.model";
import { InternalServerError } from "../../../errors/InternalServerError";
import { BadRequestError } from "../../../errors";
import { UserRepository } from "../../../shared/repository/userRepository";

export class AcademicSessionLogics {
  private userRepository = new UserRepository();
  private schoolClassModels = new SchoolClassSubjectModels();
  private academicSession = new AcademicSessionModel();
  public createAcademicSession: RequestHandler = async (req, res, next) => {
    try {
      const { schoolId } = req.params;
      const findSchool = await this.userRepository.findSchoolByUserId(schoolId);
      const result = await prisma.$transaction(
        async (tx) => {
          const isAcademicSessionExist = await tx.academicSession.findFirst({
            where: { sessionName: req.body.sessionName, schoolId: findSchool.id },
          });
          const getFromAcademicSessionsForFinancialPurpose = await tx.academicSession.findMany({
            where: {
              schoolId: findSchool.id,
            },
            include: {
              academicSessionTerms: true,
            },
          });
          if (isAcademicSessionExist) {
            throw new BadRequestError("Academic session already exist in your school");
          }
          const academicSession = await tx.academicSession.findFirst({
            where: { schoolId: findSchool.id, current: true },
          });
          if (academicSession?.current) {
            throw new BadRequestError("AcademicSession with current status exits");
          }
          const term = await tx.academicSessionTerm.findFirst({
            where: { schoolId: findSchool.id, current: true },
          });
          if (term) {
            throw new BadRequestError("The previous academic session has a current term");
          }
          const classes = await this.schoolClassModels.getSchoolClasses(findSchool.id);
          const createdAcademicSession = await tx.academicSession.create({
            data: {
              schoolId: findSchool.id,
              sessionName: req.body.sessionName,
              current: true,
              sessionStartDate: req.body.sessionStartDate,
              sessionEndDate: req.body.sessionEndDate,
            },
          });
          if (!createdAcademicSession) {
            throwError(
              "Could not create academic session, please try again or contact guident customer care",
              StatusCodes.BAD_REQUEST
            );
          }
          const createTerm = await tx.academicSessionTerm.create({
            data: {
              termName: req.body.termName,
              termEndDate: req.body.termEndDate,
              termStartDate: req.body.termStartDate,
              current: true,
              schoolId: findSchool.id,
              academicSessionId: createdAcademicSession.id,
            },
          });
          if (!createTerm) {
            throw new InternalServerError("Error creating academic session term");
          }
          const schoolClassesAcademicSessions = classes.map((classItem) => {
            return {
              classId: classItem.id,
              schoolId: findSchool.id,
              academicSessionId: createdAcademicSession.id,
            };
          });
          const linkClassToAcademicSession = await tx.schoolClassAcademicSession.createMany({
            data: schoolClassesAcademicSessions,
          });
          if (!linkClassToAcademicSession) {
            throw new InternalServerError("Error creating academic session");
          }
          if (getFromAcademicSessionsForFinancialPurpose.length > 0) {
            const getLastAcademicSessionFee =
              getFromAcademicSessionsForFinancialPurpose[
                getFromAcademicSessionsForFinancialPurpose.length > 1
                  ? getFromAcademicSessionsForFinancialPurpose.length - 1
                  : 0
              ];
            const transferFinancialRecordFee = await tx.financialType.findMany({
              where: {
                schoolId: findSchool.id,
                academicSessionId: getLastAcademicSessionFee.id,
                academicSessionTermId:
                  getLastAcademicSessionFee.academicSessionTerms[
                    getLastAcademicSessionFee.academicSessionTerms.length > 1
                      ? getLastAcademicSessionFee.academicSessionTerms.length - 1
                      : 0
                  ].id,
              },
            });
            if (transferFinancialRecordFee.length) {
              for (const newFeeTransfer of transferFinancialRecordFee) {
                if (transferFinancialRecordFee) {
                  await tx.financialType.create({
                    data: {
                      academicSessionId: createdAcademicSession.id,
                      academicSessionTermId: createTerm.id,
                      schoolId: findSchool.id,
                      feeAmount: newFeeTransfer.feeAmount,
                      name: newFeeTransfer.name,
                      classId: newFeeTransfer.classId
                    },
                  });
                }
              }
            }
          }
          return true;
        },
        {
          maxWait: 8000,
          timeout: 10000,
        }
      );
      if (!result) {
        throw new InternalServerError("Experience server error creating academic session");
      }
      res
        .status(StatusCodes.CREATED)
        .json({ message: "A new academic session created successfully" });
    } catch (error) {
      next(error);
    }
  };
  public getSchoolAcademicSessions: RequestHandler = async (req, res, next) => {
    const { schoolId } = req.params;
    const findSchool = await this.userRepository.findSchoolByUserId(schoolId);
    try {
      const academicSessions = await this.academicSession.getAllAcademicSessions(findSchool.id);
      res.status(StatusCodes.OK).json({ message: "Fetch successfully", data: academicSessions });
    } catch (error) {
      next(error);
    }
  };
  public getSchoolAcademicSession: RequestHandler = async (req, res, next) => {
    try {
      const academicSession = await prisma.academicSession.findUnique({
        where: {
          id: req.params.academicSessionId,
        },
        include: {
          studentAcademicSessions: {
            select: {
              id:true,
              student: true,
              academicSession: true,
              academicSessionTerm: true,
              class: {
                select: {
                  id: true,
                  schoolId: true,
                  className: true,
                  subjects: true,
                },
              },
            },
          },
          classes: {
            select: {
              class: true,
            },
          },
          assessments: true,
          academicSessionTerms: true,
          behaviours: true,
          financialRecords: true,
          schoolStudentSkills: true,
          schoolAssignments: true,
          schoolAnnouncements: true,
        },
      });
      res.status(StatusCodes.OK).json({ message: "Fetch successfully", data: academicSession });
    } catch (error) {
      next(error);
    }
  };
  public updateAcademicSession: RequestHandler = async (req, res, next) => {
    try {
      await this.academicSession.getAcademicSessionByIdCurrentAndSchoolId(
        req.params.academicSessionId
      );
      const updateAcademicSessions = await prisma.academicSession.update({
        where: {
          id: req.params.academicSessionId as string,
        },
        data: {
          sessionName: req.body.sessionName,
          sessionStartDate: req.body.sessionStartDate,
          sessionEndDate: req.body.sessionEndDate,
        },
      });
      if (!updateAcademicSessions) {
        throwError("Failed to update academicSession", StatusCodes.BAD_REQUEST);
      }
      res
        .status(StatusCodes.OK)
        .json({ message: "Updated successfully", data: updateAcademicSessions });
    } catch (error) {
      next(error);
    }
  };

  public endAcademicSession: RequestHandler = async (req, res, next) => {
    try {
      const academicSession = await prisma.academicSession.findUnique({
        where: { id: req.params.academicSessionId },
      });
      if (!academicSession?.current) {
        throw new BadRequestError("AcademicSession already ended");
      }
      const term = await prisma.academicSessionTerm.findFirst({
        where: { academicSessionId: req.params.academicSessionId, current: true },
      });
      if (term) {
        throw new BadRequestError("This academic session has a current term");
      }
      const updateAcademicSessions = await prisma.academicSession.update({
        where: {
          id: req.params.academicSessionId as string,
        },
        data: {
          current: false,
        },
      });
      if (!updateAcademicSessions) {
        throwError("Failed to update academicSession", StatusCodes.BAD_REQUEST);
      }
      res.status(StatusCodes.OK).json({ message: "Academic session ended successfully" });
    } catch (error) {
      next(error);
    }
  };
}
