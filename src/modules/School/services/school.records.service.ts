import { RequestHandler } from "express";
import * as fs from "fs";
import { StatusCodes } from "http-status-codes";
import { UserRepository } from "../../../shared/repository/userRepository";
import { AcademicSessionModel } from "../../AcademicSession/application/academicSession.model";
import { AcademicSessionTermModel } from "../../Term/application/term.model";
import { SchoolClassSubjectModels } from "../../SchoolClass/application/class.model";
import prisma from "../../../database/PgDB";

export class SchoolRecords {
  private userRepository = new UserRepository();
  private academicSession = new AcademicSessionModel();
  private academicSessionTerm = new AcademicSessionTermModel();
  private schoolClass = new SchoolClassSubjectModels();
  public getSchoolRecords: RequestHandler = async (req, res, next) => {
    try {
      const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
      await this.academicSession.findAcademicSessionById(req.body.academicSessionId);
      await this.academicSessionTerm.findAcademicSessionTermById(req.body.academicSessionTermId);
      await this.schoolClass.findSubjectClass(req.body.subjectId, req.body.classId, school.id);
      if (req.body.category === "results") {
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
        res.status(StatusCodes.OK).json({
          message: "Fetched successfully",
          data: this.mapSchoolResults(results?.results as any),
          type: req.body.type,
        });
      } else {
        const parentStudentsData = await prisma.studentAcademicSession.findMany({
          where: {
            academicSessionId: req.query.academicSessionId as string,
            academicSessionTermId: req.query.academicSessionTermId as string,
            classId: req.query.classId as string,
            schoolId: school.id,
          },
          include: {
            class: {
              select: {
                className: true,
              },
            },
            academicSessionTerm: {
              select: {
                termName: true,
              },
            },
            academicSession: {
              select: {
                sessionName: true,
              },
            },
            student: {
              include: {
                student: {
                  include: {
                    parent: {
                      select: {
                        occupation: true,
                        fullName: true,
                        parentAddress: true,
                        user: {
                          select: {
                            email: true,
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
        res.status(StatusCodes.OK).json({
          message: "fetch",
          data: this.mapParentDetails(parentStudentsData as any as ParentResult[]),
          type: req.body.type,
        });
      }
    } catch (error) {
      next(error);
    }
  };

  private mapParentDetails(results: ParentResult[]): string {
    const headers = [
      "Parent Name",
      "Parent Occupation",
      "Parent Email",
      "Parent Address",
      "Student Name",
      "Class Name",
      "Term",
      "Academic Session",
    ];
    const rows: any[] = [];
    results.forEach((item) => {
      const student = item.student.student;
      const parent = student.parent;
      const parentName = parent.fullName;
      const parentOccupation = parent.occupation;
      const parentEmail = parent.user.email;
      const parentAddress = parent.parentAddress;
      const studentName = `${student.firstName} ${student.lastName}`;
      const className = item.class.className;
      const termName = item.academicSessionTerm.termName;
      const academicSessionName = item.academicSession.sessionName;
      rows.push([
        parentName,
        parentOccupation,
        parentEmail,
        parentAddress,
        studentName,
        className,
        termName,
        academicSessionName,
      ]);
    });
    const csvContent = headers.join(",") + "\n" + rows.map((row) => row.join(",")).join("\n");
    fs.writeFileSync("school_parent_results.csv", csvContent);
    return csvContent;
  }

  private mapSchoolResults(results: Result[]): string {
    const assessments: string[] = [];
    const assessmentSubjectMap: Map<string, Set<string>> = new Map();
    results.forEach((result) => {
      const subject = result.subject.subject;
      const assessment = result.assessment.assessmentName;

      if (!assessmentSubjectMap.has(subject)) {
        assessmentSubjectMap.set(subject, new Set());
      }
      assessmentSubjectMap.get(subject)!.add(assessment);

      if (!assessments.includes(assessment)) {
        assessments.push(assessment);
      }
    });
    assessments.sort();
    const dataRows: any[] = [];
    const studentMap: Map<string, any> = new Map();
    results.forEach((result) => {
      const studentName = `${result.studentAcademicSession.student.student.firstName} ${result.studentAcademicSession.student.student.lastName}`;
      const assessment = result.assessment.assessmentName;
      const subject = result.subject.subject;
      const score = result.commentaryScore !== null ? Number(result.commentaryScore) : result.score;
      if (!studentMap.has(studentName)) {
        studentMap.set(studentName, { studentName, scores: {} });
      }
      if (!studentMap.get(studentName).scores[subject]) {
        studentMap.get(studentName).scores[subject] = {};
      }
      studentMap.get(studentName).scores[subject][assessment] = score;
    });
    studentMap.forEach((student, studentName) => {
      const row: any[] = [studentName];
      assessmentSubjectMap.forEach((assessmentsSet, subject) => {
        assessments.forEach((assessment) => {
          row.push(student.scores[subject]?.[assessment] || 0);
        });
        const total = assessments.reduce((acc, assessment) => {
          return acc + (student.scores[subject]?.[assessment] || 0);
        }, 0);
        row.push(total);
      });
      dataRows.push(row);
    });
    const headers = ["Student Name"];
    assessmentSubjectMap.forEach((_, subject) => {
      assessments.forEach((assessment) => {
        headers.push(`${subject} - ${assessment}`);
      });
      headers.push(`${subject} - Total`);
    });
    const csvResultsContent =
      headers.join(",") + "\n" + dataRows.map((row) => row.join(",")).join("\n");
    console.log("CSV file has been generated successfully.");
    fs.writeFileSync("school_results.csv", csvResultsContent);
    return csvResultsContent;
  }
}

interface Result {
  id: string;
  subject: { subject: string };
  commentaryScore: string | null;
  assessment: { assessmentName: string };
  score: number;
  studentAcademicSession: {
    student: {
      student: { firstName: string; lastName: string };
    };
  };
}

interface ParentResult {
  id: string;
  class: { className: string };
  academicSessionTerm: { termName: string };
  academicSession: { sessionName: string };
  student: {
    student: {
      firstName: string;
      lastName: string;
      parent: {
        fullName: string;
        occupation: string;
        parentAddress: string;
        user: { email: string };
      };
    };
  };
}
