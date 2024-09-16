import { RequestHandler } from "express";
import { UserRepository } from "../../../shared/repository/userRepository";
import { AcademicSessionModel } from "../../AcademicSession/application/academicSession.model";
import { AcademicSessionTermModel } from "../../Term/application/term.model";
import { SchoolClassSubjectModels } from "../../SchoolClass/application/class.model";
import prisma from "../../../database/PgDB";
import { BadRequestError } from "../../../errors";
import { InternalServerError } from "../../../errors/InternalServerError";
import { StatusCodes } from "http-status-codes";
import {
  calculateSubjectTotalScores,
  calculateTotalScorePercentage,
  calculateTotalScores,
  getPositionInClass,
  processStudentResults,
} from "../application/functions";
import { findOrCreateClassResult } from "../../../shared/functions/sharedFunctions";

export class ResultsAndApproval {
  private userRepository = new UserRepository();
  private academicSession = new AcademicSessionModel();
  private academicSessionTerm = new AcademicSessionTermModel();
  private schoolClass = new SchoolClassSubjectModels();
  public uploadResult: RequestHandler = async (req, res, next) => {
    try {
      const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
      const records = req.body.records as {
        score: number;
        studentAcademicSessionId: string;
        commentaryScore?: string;
      }[];
      await this.academicSession.findAcademicSessionById(req.body.academicSessionId);
      await this.academicSessionTerm.findAcademicSessionTermById(req.body.academicSessionTermId);
      await this.schoolClass.findSubjectClass(req.body.subjectId, req.body.classId, school.id);
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
          commentaryScore?: string;
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
      const classResultId = await findOrCreateClassResult(
        req.body.classId,
        req.body.academicSessionId,
        req.body.academicSessionTermId,
        school.id
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
        commentaryScore?: string;
      }[];
      if (!getStudentsWithoutResults.length) {
        throw new BadRequestError(
          `All results records already exits for this academic session, term and class and subject`
        );
      }
      const results = getStudentsWithoutResults.map((record) => {
        if (
          req.body.resultType === "result" &&
          ((record.score > findAssessment?.grade) as unknown as number)
        ) {
          throw new BadRequestError(`This assessment can only ${findAssessment?.grade} score`);
        }
        return {
          score: record.score,
          commentaryScore: record?.commentaryScore,
          studentAcademicSessionId: record.studentAcademicSessionId,
          schoolId: school.id,
          subjectId: req.body.subjectId,
          assessmentId: req.body.assessmentId,
          classId: req.body.classId,
          academicSessionId: req.body.academicSessionId,
          academicSessionTermId: req.body.academicSessionTermId,
          classResultId: classResultId,
        };
      });
      if (classResultId) {
        const createResults = await prisma.studentAcademicSessionResult.createMany({
          data: results,
        });
        if (!createResults) {
          throw new InternalServerError("Failed to create results");
        }
      }
      res.status(StatusCodes.CREATED).json({ message: "Results uploaded successfully" });
    } catch (error) {
      next(error);
    }
  };
  public fetchClassResults: RequestHandler = async (req, res, next) => {
    try {
      const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
      const results = await prisma.classResult.findFirst({
        where: {
          academicSessionId: req.query.academicSessionId as string,
          academicSessionTermId: req.query.academicSessionTermId as string,
          classId: req.query.classId as string,
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
                          otherName: true,
                          parent: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
      let processedStudentResults;
      if (results?.results) {
        processedStudentResults = processStudentResults(results?.results);
      }
      return res
        .status(StatusCodes.OK)
        .json({ message: "Fetched!", data: processedStudentResults });
    } catch (error) {
      next(error);
    }
  };
  public viewStudentClassResult: RequestHandler = async (req, res, next) => {
    const studentAcademicSessionId = req.query.studentAcademicSessionId as string;
    try {
      const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
      const results = await prisma.classResult.findFirst({
        where: {
          academicSessionId: req.query.academicSessionId as string,
          academicSessionTermId: req.query.academicSessionTermId as string,
          classId: req.query.classId as string,
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
      return res.status(StatusCodes.OK).json({
        behaviours: behaviours,
        results: studentResults,
        studentPosition: studentPosition,
        studentPercentage: studentPercentage,
        remarks: remarks,
        skills: skills,
        attendance: attendanceRecords ? attendanceRecords[0] : undefined,
        message: "Fetched successfully",
        student: results?.results.filter(
          (result) => result.studentAcademicSessionId === studentAcademicSessionId
        )[0]?.studentAcademicSession?.student,
      });
    } catch (error) {
      next(error);
    }
  };
}
