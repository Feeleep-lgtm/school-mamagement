import { RequestHandler } from "express";
import prisma from "../../../database/PgDB";
import { StatusCodes } from "http-status-codes";
import { InternalServerError } from "../../../errors/InternalServerError";
import { UserRepository } from "../../../shared/repository/userRepository";
import { AcademicSessionModel } from "../../AcademicSession/application/academicSession.model";
import { AcademicSessionTermModel } from "../../Term/application/term.model";
import { SchoolClassSubjectModels } from "../../SchoolClass/application/class.model";
import { BadRequestError } from "../../../errors";
import { updateStudentResultError } from "../../../errors/CreateResultError";
import {
  calculateSubjectTotalScores,
  calculateTotalScorePercentage,
  calculateTotalScores,
  calculateTotalSubjectCount,
  getPositionInClass,
  processStudentResults,
} from "../application/functions";

export class SchoolResult {
  private userRepository = new UserRepository();
  private academicSession = new AcademicSessionModel();
  private academicSessionTerm = new AcademicSessionTermModel();
  private schoolClass = new SchoolClassSubjectModels();
  public uploadResult: RequestHandler = async (req, res, next) => {
    try {
      const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
      await this.academicSession.findAcademicSessionById(req.body.academicSessionId);
      await this.academicSessionTerm.findAcademicSessionTermById(req.body.academicSessionTermId);
      await this.schoolClass.findSubjectClass(req.body.subjectId, req.body.classId, school.id);
      const records = req.body.records as {
        score: number;
        studentAcademicSessionId: string;
      }[];
      const findAssessment = await prisma.assessment.findUnique({
        where: {
          id: req.body.assessmentId,
        },
      });
      if (!findAssessment) {
        throw new BadRequestError("Assessment is invalid");
      }
      const removeDuplicate = new Map<
        string,
        {
          score: number;
          studentAcademicSessionId: string;
        }
      >();
      records.forEach((ele) => {
        removeDuplicate.set(ele.studentAcademicSessionId, ele);
      });
      const recordsToUploads = Array.from(removeDuplicate.values());
      const findExistingResults = await prisma.studentAcademicSessionResult.findMany({
        where: {
          studentAcademicSessionId: {
            in: recordsToUploads.map(
              (studentAcademicSessionId) => studentAcademicSessionId.studentAcademicSessionId
            ),
          },
          schoolId: school.id,
          subjectId: req.body.subjectId,
          assessmentId: req.body.assessmentId,
          classId: req.body.classId,
          academicSessionId: req.body.academicSessionId,
          academicSessionTermId: req.body.academicSessionTermId,
        },
        include: {
          studentAcademicSession: {
            select: {
              student: {
                select: {
                  student: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      const studentsWithoutResults: string[] = findExistingResults.map(
        (studentAcademicSession) => studentAcademicSession.studentAcademicSessionId
      );
      const getStudentsWithoutResults = recordsToUploads
        .map((record) => {
          if (!studentsWithoutResults.includes(record.studentAcademicSessionId)) {
            return record;
          }
        })
        .filter((record) => record !== undefined) as {
        score: number;
        studentAcademicSessionId: string;
      }[];
      if (!getStudentsWithoutResults.length) {
        throw new BadRequestError(
          `All results records already exits for this academic session, term and class and subject`
        );
      }
      const results = getStudentsWithoutResults.map((record) => {
        if ((record.score > findAssessment?.grade) as unknown as number) {
          throw new BadRequestError(`This assessment can only ${findAssessment?.grade} score`);
        }
        return {
          score: record.score,
          studentAcademicSessionId: record.studentAcademicSessionId,
          schoolId: school.id,
          subjectId: req.body.subjectId,
          assessmentId: req.body.assessmentId,
          classId: req.body.classId,
          academicSessionId: req.body.academicSessionId,
          academicSessionTermId: req.body.academicSessionTermId,
        };
      });
      const createResults = await prisma.studentAcademicSessionResult.createMany({
        data: results,
      });
      if (!createResults) {
        throw new InternalServerError("Failed to create results");
      }
      res.status(StatusCodes.CREATED).json({ message: "Results uploaded successfully" });
    } catch (error) {
      next(error);
    }
  };
  public viewStudentResult: RequestHandler = async (req, res, next) => {
    try {
      const studentAcademicSessionId = req.query.studentAcademicSessionId as string;
      const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
      const classResults = await prisma.studentAcademicSessionResult.findMany({
        where: {
          classId: req.query.classId as string,
          academicSessionId: req.query.academicSessionId as string,
          academicSessionTermId: req.query.academicSessionTermId as string,
          schoolId: school.id,
        },
        select: {
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
          studentAcademicSessionId: true,
        },
      });
      const studentTotals = calculateTotalScores(calculateSubjectTotalScores(classResults));
      const studentPosition = getPositionInClass(studentTotals, studentAcademicSessionId);
      const studentPercentage = calculateTotalScorePercentage(
        classResults,
        studentAcademicSessionId
      );
      const studentResults = await prisma.studentAcademicSessionResult.findMany({
        where: {
          studentAcademicSessionId: studentAcademicSessionId,
          academicSessionId: req.query.academicSessionId as string,
          academicSessionTermId: req.query.academicSessionTermId as string,
          classId: req.query.classId as string,
          schoolId: school.id,
        },
        select: {
          score: true,
          subject: true,
          schoolId: true,
          assessment: {
            select: {
              id: true,
              assessmentName: true,
            },
          },
          academicSession: {
            select: {
              id: true,
              sessionName: true,
            },
          },
          academicSessionTerm: {
            select: {
              id: true,
              termName: true,
            },
          },
          class: {
            select: {
              id: true,
              className: true,
            },
          },
        },
      });
      const student = await prisma.studentAcademicSession.findUnique({
        where: {
          id: studentAcademicSessionId,
        },
        include: {
          student: {
            select: {
              student: {
                select: {
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
      });
      const remarks = await prisma.remark.findMany({
        where: {
          studentAcademicSessionId: studentAcademicSessionId,
          academicSessionId: req.query.academicSessionId as string,
          academicSessionTermId: req.query.academicSessionTermId as string,
          classId: req.query.classId as string,
          schoolId: school.id,
        },
      });
      const behaviours = await prisma.behaviour.findMany({
        where: {
          studentAcademicSessionId: studentAcademicSessionId,
          academicSessionId: req.query.academicSessionId as string,
          academicSessionTermId: req.query.academicSessionTermId as string,
          classId: req.query.classId as string,
          schoolId: school.id,
        },
      });
      const skills = await prisma.schoolStudentSkill.findMany({
        where: {
          studentAcademicSessionId: studentAcademicSessionId,
          academicSessionId: req.query.academicSessionId as string,
          academicSessionTermId: req.query.academicSessionTermId as string,
          classId: req.query.classId as string,
          schoolId: school.id,
        },
      });
      const attendanceRecords = await prisma.attendance.findFirst({
        where: {
          studentAcademicSessionId: req.body.studentAcademicSessionId,
          academicSessionId: req.body.academicSessionId,
          academicSessionTermId: req.body.academicSessionTermId,
          classId: req.body.classId,
          schoolId: school.id,
        },
        select: {
          totalDays: true,
          presentDays: true,
          absentDays: true,
        },
      });
      res.status(StatusCodes.OK).json({
        message: "Fetched successfully",
        results: studentResults,
        student: student,
        remarks: remarks,
        behaviours: behaviours,
        skills: skills,
        attendance: attendanceRecords,
        studentPosition: studentPosition,
        studentPercentage: studentPercentage,
      });
    } catch (error) {
      next(error);
    }
  };
  public filterEditResults: RequestHandler = async (req, res, next) => {
    try {
      const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
      const studentResults = await prisma.studentAcademicSessionResult.findMany({
        where: {
          academicSessionId: req.query.academicSessionId as string,
          academicSessionTermId: req.query.academicSessionTermId as string,
          classId: req.query.classId as string,
          schoolId: school.id,
          subjectId: req.query.subjectId as string,
          assessmentId: req.query.assessmentId as string,
        },
        include: {
          studentAcademicSession: {
            select: {
              id: true,
              student: {
                select: {
                  student: {
                    select: {
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
      res
        .status(StatusCodes.OK)
        .json({ message: "Result fetched successfully", results: studentResults });
    } catch (error) {
      next(error);
    }
  };
  public updateResults: RequestHandler = async (req, res, next) => {
    try {
      const updateRecords = req.body.records as { score: number; resultId: string }[];
      const studentIdsToCheck = updateRecords.map(
        (record: { resultId: string }) => record.resultId
      ) as string[];
      const existingStudents = await prisma.studentAcademicSessionResult.findMany({
        where: {
          id: {
            in: studentIdsToCheck,
          },
        },
      });
      const existingStudentResultsIds = existingStudents.map((result) => result);
      const nonExistingResults = studentIdsToCheck.filter(
        (resultId) => !existingStudentResultsIds.map((result) => result.id).includes(resultId)
      );
      if (nonExistingResults.length) {
        const studentNames = nonExistingResults.map((result) => {
          return {
            studentName: `${result}`,
            resultId: result,
          };
        });
        throw new updateStudentResultError(`The following result don't exist`, studentNames);
      }
      const findAssessment = await prisma.assessment.findUnique({
        where: {
          id: req.body.assessmentId,
        },
      });
      if (!findAssessment) {
        throw new BadRequestError("Assessment is invalid");
      }
      const updatedResults = await Promise.all(
        updateRecords.map(async (record: { resultId: string; score: number }) => {
          if ((record.score > findAssessment?.grade) as unknown as number) {
            throw new BadRequestError(`This assessment can only ${findAssessment?.grade} score`);
          }
          const updatedResult = await prisma.studentAcademicSessionResult.update({
            where: {
              id: record.resultId,
            },
            data: {
              score: record.score,
            },
          });
          return updatedResult;
        })
      );
      res.status(StatusCodes.OK).json({ message: "Results updated successfully", updatedResults });
    } catch (error) {
      next(error);
    }
  };
  public filterResults: RequestHandler = async (req, res, next) => {
    try {
      const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
      const studentResults = await prisma.studentAcademicSessionResult.findMany({
        where: {
          academicSessionId: req.query.academicSessionId as string,
          academicSessionTermId: req.query.academicSessionTermId as string,
          classId: req.query.classId as string,
          schoolId: school.id,
        },
        select: {
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
      res
        .status(StatusCodes.OK)
        .json({ message: "Result fetched successfully", results: processedStudentResults });
    } catch (error) {
      next(error);
    }
  };
}
