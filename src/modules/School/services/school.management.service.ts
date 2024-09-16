import { RequestHandler } from "express";
import prisma from "../../../database/PgDB";
import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "../../../errors";
import { UserRepository } from "../../../shared/repository/userRepository";
import { InternalServerError } from "../../../errors/InternalServerError";
import { AcademicSessionModel } from "../../AcademicSession/application/academicSession.model";
import { AcademicSessionTermModel } from "../../Term/application/term.model";
import { SchoolClassSubjectModels } from "../../SchoolClass/application/class.model";
import { findClassWithMostStudents } from "../application/functions";
import {
  findOrCreateClassResult,
  removeDuplicateKeyValues,
} from "../../../shared/functions/sharedFunctions";

export class SchoolManagement {
  private userRepository = new UserRepository();
  private academicSession = new AcademicSessionModel();
  private academicSessionTerm = new AcademicSessionTermModel();
  private schoolClass = new SchoolClassSubjectModels();

  public searchParent: RequestHandler = async (req, res, next) => {
    try {
      const parent = await prisma.parent.findMany({
        where: {
          AND: [
            {
              OR: [
                { user: { email: req.body.parentIdentity } },
                { parentPhoneNumber: req.body.parentIdentity },
              ],
            },
          ],
        },
        include: {
          user: true,
        },
      });

      res.status(StatusCodes.OK).json({ parent });
    } catch (error: any) {
      next(error);
    }
  };

  public async updateStudentClass(studentId: string) {
    try {
      return "Student class repeated successfully";
    } catch (error: any) {}
  }
  public async deleteStudent(studentId: string) {
    try {
      await prisma.student.delete({
        where: {
          id: studentId,
        },
      });
      return "Student deleted successfully";
    } catch (error: any) {
      throw new Error(`Failed to delete student: ${error.message}`);
    }
  }
  public remarks: RequestHandler = async (req, res, next) => {
    try {
      const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
      await this.academicSession.findAcademicSessionById(req.body.academicSessionId);
      await this.academicSessionTerm.findAcademicSessionTermById(req.body.academicSessionTermId);
      await this.schoolClass.findSubjectClass(req.body.subjectId, req.body.classId, school.id);
      const classResultId = await findOrCreateClassResult(
        req.body.classId,
        req.body.academicSessionId,
        req.body.academicSessionTermId,
        school.id
      );
      const checkIdRemarkExist = await prisma.remark.findFirst({
        where: {
          schoolId: school.id,
          studentAcademicSessionId: req.body.studentAcademicSessionId,
          academicSessionId: req.body.academicSessionId as string,
          academicSessionTermId: req.body.academicSessionTermId as string,
          classId: req.body.classId as string,
          remarkType: req.body.remarkType,
        },
      });
      if (checkIdRemarkExist) {
        await prisma.remark.update({
          where: { id: checkIdRemarkExist.id },
          data: {
            comment: req.body.comment,
            signature: req.body.signature ? req.body.signature : checkIdRemarkExist.signature,
          },
        });
      } else {
        await prisma.remark.create({
          data: {
            schoolId: school.id,
            studentAcademicSessionId: req.body.studentAcademicSessionId,
            academicSessionId: req.body.academicSessionId as string,
            academicSessionTermId: req.body.academicSessionTermId as string,
            classId: req.body.classId as string,
            comment: req.body.comment,
            remarkType: req.body.remarkType,
            signature: req.body.signature ? req.body.signature : "",
            classResultId: classResultId,
          },
        });
      }
      res.status(StatusCodes.CREATED).json({ message: "Remark recorded successfully" });
    } catch (error) {
      next(error);
    }
  };
  public deactivateAccount: RequestHandler = async (req, res, next) => {
    try {
      const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
      await prisma.user.update({
        where: {
          id: school.userId,
        },
        data: {
          status: "BLOCKED",
        },
      });
      res.status(StatusCodes.OK).json({ message: "Account deleted successfully" });
    } catch (error) {
      next(error);
    }
  };
  public completeParentOnboarding: RequestHandler = async (req, res, next) => {
    try {
      const findParentUser = await this.userRepository.findUserByEmail(req.body.email);
      if (!findParentUser.isEmailVerified) {
        throw new BadRequestError("Please allow parent verify email address on the guident app");
      }
      const completeOnboarding = await prisma.parent.upsert({
        where: {
          userId: findParentUser.id,
        },
        update: {
          occupation: req.body.occupation,
          parentPhoneNumber: req.body.parentPhoneNumber,
          parentAddress: req.body.parentAddress,
          fullName: req.body.fullName,
        },
        create: {
          occupation: req.body.occupation,
          parentPhoneNumber: req.body.parentPhoneNumber,
          parentAddress: req.body.parentAddress,
          userId: findParentUser.id,
          fullName: req.body.fullName,
        },
      });
      await prisma.user.update({
        where: {
          id: findParentUser.id,
        },
        data: {
          profileCompleted: true,
          status: "ACTIVE",
        },
      });
      if (!completeOnboarding) {
        throw new InternalServerError(
          "Failed to update profile(Potential cause could be phoneNumber)"
        );
      }
      res.status(StatusCodes.OK).json({ message: "Updated successfully" });
    } catch (error) {
      next(error);
    }
  };
  public promoteStudent: RequestHandler = async (req, res, next) => {
    const { currentSessionPeriodId, currentClassId, studentIds, currentTermId } =
      req.body.studentCurrentPositionInfo;
    const { newSessionPeriodId, newClassId, newTermId } = req.body.newPositionData;
    const removeDuplicateStudentIds = removeDuplicateKeyValues([...studentIds], "studentId");
    try {
      const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
      // for current Academic Session
      await this.academicSession.findAcademicSessionById(currentSessionPeriodId);
      await this.academicSessionTerm.findAcademicSessionTermById(currentTermId);
      await this.schoolClass.findClass(currentClassId);
      // for admitting Academic Session
      await this.academicSession.findAcademicSessionById(newSessionPeriodId);
      await this.academicSessionTerm.findAcademicSessionTermById(newTermId);
      await this.schoolClass.findClass(newClassId);
      const students: {
        academicSessionId: string;
        academicSessionTermId: string;
        classId: string;
        schoolId: string;
        schoolStudentId: string;
      }[] = [];
      const promotedStudents = await prisma.$transaction(async (tx) => {
        const checkAlreadyPromotedStudents = await tx.studentAcademicSession.findMany({
          where: {
            student: {
              student: {
                id: {
                  in: [...studentIds].map(({ studentId }) => studentId),
                },
              },
            },
            academicSessionId: newSessionPeriodId,
            academicSessionTermId: newTermId,
            classId: newClassId,
            schoolId: school.id,
          },
          include: {
            student: {
              select: {
                student: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        });
        const studentsWithNewPromotion: string[] = checkAlreadyPromotedStudents
          .map((studentAcademicSession) => studentAcademicSession.student.student.id)
          .filter((student) => student !== undefined);
        const studentsWithoutNewPromotion = removeDuplicateStudentIds
          .map((student) => {
            if (!studentsWithNewPromotion.includes(student.studentId)) {
              return student;
            }
          })
          .filter((student) => student !== undefined);

        if (!studentsWithoutNewPromotion.length) {
          throw new BadRequestError(
            `All student provided are already prompted to the provided new class`
          );
        }
        for (const studentToPromote of studentsWithoutNewPromotion) {
          const schoolStudent = await tx.studentAcademicSession.findFirst({
            where: {
              student: {
                student: {
                  id: studentToPromote.studentId,
                },
              },
            },
          });
          if (!schoolStudent) {
            throw new BadRequestError("student not found");
          }
          const findSchoolStudent = await tx.schoolStudent.findFirst({
            where: {
              id: schoolStudent.schoolStudentId,
            },
          });
          if (!findSchoolStudent) {
            throw new BadRequestError("Student not found in the school");
          }
          if (schoolStudent?.academicSessionId !== currentSessionPeriodId) {
            throw new BadRequestError("Academic session is not matching");
          } else if (schoolStudent?.academicSessionTermId !== currentTermId) {
            throw new BadRequestError("Academic session term is not matching");
          } else if (schoolStudent?.classId !== currentClassId) {
            throw new BadRequestError("Academic session term is not matching");
          }
          students.push({
            academicSessionId: newSessionPeriodId,
            academicSessionTermId: newTermId,
            classId: newClassId,
            schoolId: school.id,
            schoolStudentId: findSchoolStudent.id,
          });
        }
        const promoteStudents = await tx.studentAcademicSession.createMany({
          data: students,
        });
        return { promoteStudents, students };
      });
      res.status(StatusCodes.OK).json({ message: "Promoted successfully", data: promotedStudents });
    } catch (error) {
      next(error);
    }
  };
  public getSchoolAccount: RequestHandler = async (req, res, next) => {
    try {
      const school = await this.userRepository.getSchoolWithAllRelations(req.params.schoolId);
      const schoolClasses = await prisma.schoolClass.findMany({
        where: {
          schoolId: school.id,
        },
        include: {
          subjects: true,
          studentAcademicSession: {
            select: {
              id: true,
              academicSession: {
                select: {
                  current: true,
                },
              },
            },
          },
        },
      });
      const classWithMostStudents = await findClassWithMostStudents(schoolClasses);
      res.status(StatusCodes.OK).json({ message: "OK", data: school, classWithMostStudents });
    } catch (error) {
      next(error);
    }
  };
}
