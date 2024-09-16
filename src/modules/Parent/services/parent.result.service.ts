import { RequestHandler } from "express";
import prisma from "../../../database/PgDB";
import { StatusCodes } from "http-status-codes";
import { UserRepository } from "../../../shared/repository/userRepository";
import {
  calculateSubjectTotalScores,
  calculateTotalScorePercentage,
  calculateTotalScores,
  getPositionInClass,
} from "../../School/application/functions";

export class ParentResult {
  private userRepository = new UserRepository();
  public viewStudentResult: RequestHandler = async (req, res, next) => {
    try {
      const studentAcademicSessionId = req.query.studentAcademicSessionId as string;
      const school = await this.userRepository.findSchoolByUserId(req.query.schoolUserId as string);
      const parentId = (await this.userRepository.findParentByUserId(req.params.parentId)).userId;
      const parent = await prisma.parent.findUnique({
        where: { userId: parentId },
        include: {
          user: true,
          children: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
              otherName: true,
              nationality: true,
              stateOfOrigin: true,
              localGovernmentArea: true,
              profilePicture: true,
              imageUrl: true,
              userName: true,
              createdAt: true,
              parentId: true,
              schools: true,
            },
          },
        },
      });
      let studentResultToCheckId;
      parent?.children.map((child) => {
        if (child.id === req.params.studentId) {
          studentResultToCheckId = child.id;
        }
      });
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
              grade: true,
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
              grade: true,
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
              school: {
                select: {
                  address: true,
                  schoolName: true,
                  user: {
                    select: {
                      profilePicture: true,
                    },
                  },
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
        message: "Fetch",
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
  public parentStudentsDashboardResults: RequestHandler = async (req, res, next) => {
    try {
      const parentId = (await this.userRepository.findParentByUserId(req.params.parentId)).userId;
      const parent = await prisma.parent.findUnique({
        where: { userId: parentId },
        include: {
          user: true,
          children: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
              otherName: true,
              nationality: true,
              stateOfOrigin: true,
              localGovernmentArea: true,
              profilePicture: true,
              imageUrl: true,
              userName: true,
              createdAt: true,
              parentId: true,
              schools: true,
            },
          },
        },
      });
      const studentIds = parent?.children.map((student) => student.id);
      const findResults = await prisma.schoolStudent.findMany({
        where: { studentId: { in: studentIds } },
        select: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              otherName: true,
              profilePicture: true,
            },
          },
          studentAcademicSessions: {
            select: {
              id: true,
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
              school: {
                select: {
                  id: true,
                  schoolName: true,
                },
              },
              studentAcademicSessionResults: {
                select: {
                  score: true,
                  assessment: {
                    select: {
                      id: true,
                      assessmentName: true,
                      grade: true,
                    },
                  },
                  subject: {
                    select: {
                      id: true,
                      subject: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      res.status(StatusCodes.OK).json({ message: "Fetched successfully", data: findResults });
    } catch (error) {
      next(error);
    }
  };
  public parentStudentsDashboardBehaviours: RequestHandler = async (req, res, next) => {
    try {
      const parentId = (await this.userRepository.findParentByUserId(req.params.parentId)).userId;
      const parent = await prisma.parent.findUnique({
        where: { userId: parentId },
        include: {
          user: true,
          children: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
              otherName: true,
              nationality: true,
              stateOfOrigin: true,
              localGovernmentArea: true,
              profilePicture: true,
              imageUrl: true,
              userName: true,
              createdAt: true,
              parentId: true,
              schools: true,
            },
          },
        },
      });
      const studentIds = parent?.children.map((student) => student.id);
      const findBehaviours = await prisma.schoolStudent.findMany({
        where: { studentId: { in: studentIds } },
        select: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              otherName: true,
              profilePicture: true,
            },
          },
          studentAcademicSessions: {
            select: {
              id: true,
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
              school: {
                select: {
                  id: true,
                  schoolName: true,
                },
              },
              behaviours: {
                select: {
                  score: true,
                  behaviourType: true,
                },
              },
            },
          },
        },
      });
      res.status(StatusCodes.OK).json({ message: "Fetched successfully", data: findBehaviours });
    } catch (error) {
      next(error);
    }
  };
  public parentStudentsDashboardSkills: RequestHandler = async (req, res, next) => {
    try {
      const parentId = (await this.userRepository.findParentByUserId(req.params.parentId)).userId;
      const parent = await prisma.parent.findUnique({
        where: { userId: parentId },
        include: {
          user: true,
          children: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
              otherName: true,
              nationality: true,
              stateOfOrigin: true,
              localGovernmentArea: true,
              profilePicture: true,
              imageUrl: true,
              userName: true,
              createdAt: true,
              parentId: true,
              schools: true,
            },
          },
        },
      });
      const studentIds = parent?.children.map((student) => student.id);
      const findSkills = await prisma.schoolStudent.findMany({
        where: { studentId: { in: studentIds } },
        select: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              otherName: true,
              profilePicture: true,
            },
          },
          studentAcademicSessions: {
            select: {
              id: true,
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
              school: {
                select: {
                  id: true,
                  schoolName: true,
                },
              },
              schoolStudentSkills: {
                select: {
                  score: true,
                  skillType: true,
                },
              },
            },
          },
        },
      });
      res.status(StatusCodes.OK).json({ message: "Fetched successfully", data: findSkills });
    } catch (error) {
      next(error);
    }
  };
  public fetchApprovedResults: RequestHandler = async (req, res, next) => {
    try {
      const parent = await this.userRepository.findParentByUserId(req.params.parentId);
      const approvedResults = await prisma.parentResults.findMany({
        where: {
          parentId: parent.id,
          studentId: req.params.studentId,
        },
        include: {
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
      res
        .status(StatusCodes.OK)
        .json({ message: "Approved results fetched successfully", data: approvedResults });
    } catch (error) {
      next(error);
    }
  };
}
