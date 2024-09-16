import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { UserRepository } from "../../../shared/repository/userRepository";
import {
  calculateSubjectTotalScores,
  calculateTotalScorePercentage,
  calculateTotalScores,
  getPositionInClass,
  processStudentResults,
} from "../application/functions";
import prisma from "../../../database/PgDB";

export class ApprovalsService {
  private userRepository = new UserRepository();
  public approveStudentAcademicResultsToParent: RequestHandler = async (req, res, next) => {
    try {
      const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
      await prisma.$transaction(async (tx) => {
        for (let { studentAcademicSessionId } of req.body.studentAcademicSessionIds as {
          studentAcademicSessionId: string;
        }[]) {
          const results = await tx.classResult.findFirst({
            where: {
              academicSessionId: req.body.academicSessionId as string,
              academicSessionTermId: req.body.academicSessionTermId as string,
              classId: req.body.classId as string,
              schoolId: school.id,
            },
            include: {
              results: {
                include: {
                  assessment: {
                    select: {
                      id: true,
                      assessmentName: true,
                    },
                  },
                  subject: {
                    select: {
                      subject: true,
                    },
                  },
                  academicSession: {
                    select: {
                      sessionName: true,
                      id: true,
                      sessionEndDate: true,
                      sessionStartDate: true,
                    },
                  },
                  class: {
                    select: {
                      id: true,
                      className: true,
                    },
                  },
                  academicSessionTerm: {
                    select: {
                      id: true,
                      termName: true,
                      termEndDate: true,
                      termStartDate: true,
                    },
                  },
                  studentAcademicSession: {
                    select: {
                      id: true,
                      student: {
                        select: {
                          student: {
                            select: {
                              id: true,
                              firstName: true,
                              lastName: true,
                              dateOfBirth: true,
                              stateOfOrigin: true,
                              profilePicture: true,
                              localGovernmentArea: true,
                              parent: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              behaviours: true,
              remarks: true,
              skills: true,
              attendanceRecords: true,
            },
          });
          const behaviours = results?.behaviours.filter(
            (result) => result.studentAcademicSessionId === studentAcademicSessionId
          );
          const remarks = results?.remarks.filter(
            (result) => result.studentAcademicSessionId === studentAcademicSessionId
          );
          const attendanceRecords = results?.attendanceRecords.filter(
            (result) => result.studentAcademicSessionId === studentAcademicSessionId
          );

          const skills = results?.skills.filter(
            (result) => result.studentAcademicSessionId === studentAcademicSessionId
          );
          const studentResults = results?.results.filter(
            (result) => result.studentAcademicSessionId === studentAcademicSessionId
          );
          const studentTotals = calculateTotalScores(
            calculateSubjectTotalScores(results?.results || [])
          );
          const studentPosition = getPositionInClass(studentTotals, studentAcademicSessionId);
          const studentPercentage = calculateTotalScorePercentage(
            results?.results || [],
            studentAcademicSessionId
          );
          const findParentResults = await tx.parentResults.findFirst({
            where: {
              academicSessionId: req.body.academicSessionId as string,
              academicSessionTermId: req.body.academicSessionTermId as string,
              classId: req.body.classId as string,
              schoolId: school.id,
              parentId: results?.results[0]?.studentAcademicSession?.student.student.parent?.id!,
              studentId: results?.results[0]?.studentAcademicSession?.student.student.id!,
              studentAcademicSessionId: studentAcademicSessionId,
            },
          });
          if (findParentResults) {
            await tx.parentResults.update({
              where: {
                id: findParentResults.id,
              },
              data: {
                reportCard: {
                  behaviours: behaviours,
                  results: studentResults,
                  studentPosition: studentPosition,
                  studentPercentage: studentPercentage,
                  remarks: remarks,
                  skills: skills,
                  attendance: attendanceRecords ? attendanceRecords[0] : undefined,
                  student: results?.results[0]?.studentAcademicSession?.student,
                },
              },
            });
          } else {
            await tx.parentResults.create({
              data: {
                academicSessionId: req.body.academicSessionId as string,
                academicSessionTermId: req.body.academicSessionTermId as string,
                classId: req.body.classId as string,
                schoolId: school.id,
                parentId: results?.results[0]?.studentAcademicSession?.student.student.parent?.id!,
                studentId: results?.results[0]?.studentAcademicSession?.student.student.id!,
                studentAcademicSessionId: studentAcademicSessionId,
                reportCard: {
                  behaviours: behaviours,
                  results: studentResults,
                  studentPosition: studentPosition,
                  studentPercentage: studentPercentage,
                  remarks: remarks,
                  skills: skills,
                  attendance: attendanceRecords ? attendanceRecords[0] : undefined,
                  student: results?.results[0]?.studentAcademicSession?.student,
                },
              },
            });
          }
          await tx.studentAcademicSessionResult.updateMany({
            where: {
              academicSessionId: req.body.academicSessionId as string,
              academicSessionTermId: req.body.academicSessionTermId as string,
              classId: req.body.classId as string,
              schoolId: school.id,
              studentAcademicSessionId: studentAcademicSessionId,
            },
            data: {
              firstApprovalStatus: "APPROVED",
              secondApprovalStatus: "APPROVED",
              parentApprovalStatus: "APPROVED",
            },
          });
        }
      });
      res.status(StatusCodes.OK).json({ message: "Results approved!" });
    } catch (error) {
      next(error);
    }
  };
  public studentsThatNeedsApprovals: RequestHandler = async (req, res, next) => {
    try {
      const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
      const studentResults = await prisma.studentAcademicSessionResult.findMany({
        where: {
          academicSessionId: req.query.academicSessionId as string,
          academicSessionTermId: req.query.academicSessionTermId as string,
          classId: req.query.classId as string,
          schoolId: school.id,
          assessmentId: req.query.assessmentId as string,
        },
        select: {
          firstApprovalStatus: true,
          secondApprovalStatus: true,
          parentApprovalStatus: true,
          score: true,
          subject: {
            select: {
              subject: true,
            },
          },
          assessment: {
            select: {
              id: true,
              assessmentName: true,
            },
          },
          academicSession: {
            select: {
              sessionName: true,
              id: true,
              sessionEndDate: true,
              sessionStartDate: true,
            },
          },
          studentAcademicSessionId: true,
          class: {
            select: {
              id: true,
              className: true,
            },
          },
          academicSessionTerm: {
            select: {
              id: true,
              termName: true,
              termEndDate: true,
              termStartDate: true,
            },
          },
          studentAcademicSession: {
            select: {
              id: true,
              student: {
                select: {
                  student: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      otherName: true,
                      parent: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      const processedStudentResults = processStudentResults(studentResults);
      return res
        .status(StatusCodes.OK)
        .json({ message: "Fetched!", data: processedStudentResults });
    } catch (error) {
      next(error);
    }
  };
  public approveResultsByAssessment: RequestHandler = async (req, res, next) => {
    try {
      const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
      for (let { studentAcademicSessionId } of req.body.studentAcademicSessionIds as {
        studentAcademicSessionId: string;
      }[]) {
        await prisma.studentAcademicSessionResult.updateMany({
          where: {
            academicSessionId: req.query.academicSessionId as string,
            academicSessionTermId: req.query.academicSessionTermId as string,
            classId: req.query.classId as string,
            schoolId: school.id,
            assessmentId: req.query.assessmentId as string,
            studentAcademicSessionId: studentAcademicSessionId,
          },
          data: {
            firstApprovalStatus: "APPROVED",
            secondApprovalStatus: "APPROVED",
          },
        });
      }
      return res.status(StatusCodes.OK).json({ message: "Results approved successfully" });
    } catch (error) {
      next(error);
    }
  };
}
