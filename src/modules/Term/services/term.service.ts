import { RequestHandler } from "express";
import prisma from "../../../database/PgDB";
import { AcademicSessionModel } from "../../AcademicSession/application/academicSession.model";
import { BadRequestError } from "../../../errors";
import { UserRepository } from "../../../shared/repository/userRepository";
import { InternalServerError } from "../../../errors/InternalServerError";

export class AcademicSessionTermService {
  private userRepository = new UserRepository();
  private academicSession = new AcademicSessionModel();
  public createNewAcademicTerm: RequestHandler = async (req, res, next) => {
    const { schoolId } = req.params;
    const { termName, termStartDate, termEndDate } = req.body;
    const findSchool = await this.userRepository.findSchoolByUserId(schoolId);
    try {
      await this.academicSession.rejectAcademicSessionTermQueryIfCurrentFound(findSchool.id);
      const result = await prisma.$transaction(async (tx) => {
        const getFromAcademicSessionsForFinancialPurpose = await tx.academicSession.findMany({
          where: {
            schoolId: findSchool.id,
          },
          include: {
            academicSessionTerms: true,
          },
        });
        const newTerm = await tx.academicSessionTerm.create({
          data: {
            termName,
            current: true,
            termStartDate,
            termEndDate,
            academicSessionId: req.params.academicSessionId,
            schoolId: findSchool.id,
          },
        });
        const academicSession = await tx.academicSession.findUnique({
          where: {
            id: req.params.academicSessionId,
          },
          include: {
            studentAcademicSessions: true,
          },
        });
        // logic to create new academic sessions term for the students in each class
        if (academicSession?.studentAcademicSessions.length && academicSession) {
          const studentAcademicSessionArray = [];
          for (const studentAcademicSession of academicSession.studentAcademicSessions) {
            if (studentAcademicSession.academicSessionId === req.params.academicSessionId) {
              studentAcademicSessionArray.push({
                academicSessionId: req.params.academicSessionId,
                academicSessionTermId: newTerm.id,
                schoolId: findSchool.id,
                classId: studentAcademicSession.classId,
                schoolStudentId: studentAcademicSession.schoolStudentId,
              });
            }
          }
          const createStudentAcademicSessionTerm = await tx.studentAcademicSession.createMany({
            data: studentAcademicSessionArray,
          });
          if (!createStudentAcademicSessionTerm.count) {
            throw new InternalServerError("System error encountered");
          }
          return createStudentAcademicSessionTerm;
        }
        // logic that migrated previous academic sessions and last term fees settings
        if (getFromAcademicSessionsForFinancialPurpose.length > 0) {
          const getLastAcademicSessionFee =
            getFromAcademicSessionsForFinancialPurpose[
              getFromAcademicSessionsForFinancialPurpose.length > 1
                ? getFromAcademicSessionsForFinancialPurpose.length - 1
                : 0
            ];
          const transferFinancialRecordFees = await tx.financialType.findMany({
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
          if (transferFinancialRecordFees.length > 0) {
            for (const newFeeTransfer of transferFinancialRecordFees) {
              if (newFeeTransfer) {
                await tx.financialType.create({
                  data: {
                    academicSessionId: getLastAcademicSessionFee.id,
                    academicSessionTermId: newTerm.id,
                    schoolId: findSchool.id,
                    feeAmount: newFeeTransfer.feeAmount,
                    name: newFeeTransfer.name,
                    classId: newFeeTransfer.classId,
                  },
                });
              }
            }
          }
        }
      });
      res.status(201).json({ message: "New academic term created" });
    } catch (error) {
      next(error);
    }
  };

  public endAcademicTerm: RequestHandler = async (req, res, next) => {
    try {
      const { termId } = req.params;
      const findTerm = await prisma.academicSessionTerm.findFirst({
        where: {
          id: termId,
          academicSessionId: req.params.academicSessionId,
        },
      });
      if (!findTerm) {
        throw new BadRequestError("Term not found");
      }
      if (!findTerm.current) {
        throw new BadRequestError("Term already ended");
      }
      const endedTerm = await prisma.academicSessionTerm.update({
        where: { id: termId },
        data: { current: false },
      });
      res.status(200).json({ message: "Academic term ended", data: endedTerm });
    } catch (error) {
      next(error);
    }
  };

  public updateTerm: RequestHandler = async (req, res, next) => {
    try {
      const { termId } = req.params;
      const term = await prisma.academicSessionTerm.findUnique({
        where: { id: termId },
      });
      if (!term?.current) {
        throw new BadRequestError("You can't update this term because it has ended");
      }
      const { termName, termStartDate, termEndDate } = req.body;
      const updatedTerm = await prisma.academicSessionTerm.update({
        where: { id: termId },
        data: {
          termName,
          termStartDate,
          termEndDate,
        },
      });
      res.status(200).json({ message: "Term updated", data: updatedTerm });
    } catch (error) {
      next(error);
    }
  };
}
