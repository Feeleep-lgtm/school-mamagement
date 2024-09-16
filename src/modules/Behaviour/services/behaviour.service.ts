import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { BehaviourModels } from "../application/behaviour.model";
import { ViewBehaviourReferenceParams } from "../types";
import { UserRepository } from "../../../shared/repository/userRepository";
import { AcademicSessionModel } from "../../AcademicSession/application/academicSession.model";
import { AcademicSessionTermModel } from "../../Term/application/term.model";
import { SchoolClassSubjectModels } from "../../SchoolClass/application/class.model";
import { BadRequestError, updateStudentResultError } from "../../../errors";
import prisma from "../../../database/PgDB";
import { InternalServerError } from "../../../errors/InternalServerError";
import { findOrCreateClassResult } from "../../../shared/functions/sharedFunctions";

export class Behaviour {
  private userRepository = new UserRepository();
  private behaviourModels = new BehaviourModels();
  private academicSession = new AcademicSessionModel();
  private academicSessionTerm = new AcademicSessionTermModel();
  private schoolClass = new SchoolClassSubjectModels();
  public createBehaviour: RequestHandler = async (req, res, next) => {
    const records = req.body.records as {
      score: number;
      studentAcademicSessionId: string;
    }[];
    try {
      const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
      await this.academicSession.findAcademicSessionById(req.body.academicSessionId);
      await this.academicSessionTerm.findAcademicSessionTermById(req.body.academicSessionTermId);
      await this.schoolClass.findSubjectClass(req.body.subjectId, req.body.classId, school.id);
      const findExistingBehaviors = await prisma.behaviour.findMany({
        where: {
          studentAcademicSessionId: {
            in: records.map(
              (studentAcademicSessionId) => studentAcademicSessionId.studentAcademicSessionId
            ),
          },
          schoolId: school.id,
          classId: req.body.classId,
          academicSessionId: req.body.academicSessionId,
          academicSessionTermId: req.body.academicSessionTermId,
          behaviourType: (req.body.behaviourType as string).toLowerCase(),
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
      const studentsWithoutBehaviors: string[] = findExistingBehaviors.map(
        (studentAcademicSession) => studentAcademicSession.studentAcademicSessionId
      );
      const getStudentsWithoutBehaviors = records
        .map((record) => {
          if (!studentsWithoutBehaviors.includes(record.studentAcademicSessionId)) {
            return record;
          }
        })
        .filter((record) => record !== undefined) as {
        score: number;
        studentAcademicSessionId: string;
      }[];
      if (!getStudentsWithoutBehaviors.length) {
        throw new BadRequestError(
          `All Behaviors records already exits for this academic session, term and class and subject`
        );
      }
      const classResultId = await findOrCreateClassResult(
        req.body.classId,
        req.body.academicSessionId,
        req.body.academicSessionTermId,
        school.id
      );
      const Behaviors = getStudentsWithoutBehaviors.map((record) => {
        return {
          score: record.score,
          studentAcademicSessionId: record.studentAcademicSessionId,
          schoolId: school.id,
          classId: req.body.classId,
          academicSessionId: req.body.academicSessionId,
          academicSessionTermId: req.body.academicSessionTermId,
          behaviourType: (req.body.behaviourType as string).toLowerCase(),
          classResultId: classResultId,
        };
      });
      const createBehaviors = await prisma.behaviour.createMany({
        data: Behaviors,
      });
      if (!createBehaviors) {
        throw new InternalServerError("Failed to create Behaviors");
      }
      res.status(StatusCodes.CREATED).json({ message: "Behaviours uploaded successfully" });
    } catch (error) {
      next(error);
    }
  };
  public updateExistingAddBehaviour: RequestHandler = async (req, res, next) => {
    try {
      const updateRecords = req.body.records as { score: number; behaviourId: string }[];
      const studentIdsToCheck = updateRecords.map(
        (record: { behaviourId: string }) => record.behaviourId
      ) as string[];
      const existingStudents = await prisma.behaviour.findMany({
        where: {
          id: {
            in: studentIdsToCheck,
          },
        },
      });
      const existingStudentBehaviorIds = existingStudents.map((result) => result);
      const nonExistingBehaviors = studentIdsToCheck.filter(
        (behaviourId) =>
          !existingStudentBehaviorIds.map((result) => result.id).includes(behaviourId)
      );
      if (nonExistingBehaviors.length) {
        const studentNames = nonExistingBehaviors.map((result) => {
          return {
            studentName: `${result}`,
            behaviourId: result,
          };
        });
        throw new updateStudentResultError(`The following record don't exist`, studentNames);
      }
      const updatedBehaviours = await Promise.all(
        updateRecords.map(async (record: { behaviourId: string; score: number }) => {
          const updatedBehaviours = await prisma.behaviour.update({
            where: {
              id: record.behaviourId,
            },
            data: {
              score: record.score,
            },
          });
          return updatedBehaviours;
        })
      );
      res
        .status(StatusCodes.OK)
        .json({ message: "Skills updated successfully", data: updatedBehaviours });
    } catch (error) {
      next(error);
    }
  };
  public filterEditBehaviours: RequestHandler = async (req, res, next) => {
    try {
      const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
      const behaviours = await prisma.behaviour.findMany({
        where: {
          academicSessionId: req.query.academicSessionId as string,
          academicSessionTermId: req.query.academicSessionTermId as string,
          classId: req.query.classId as string,
          schoolId: school.id,
          behaviourType: (req.query.behaviourType as string).toLowerCase(),
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
      res.status(StatusCodes.OK).json({ message: "Fetched successfully", results: behaviours });
    } catch (error) {
      next(error);
    }
  };
  public viewBehaviour: RequestHandler = async (req, res, next) => {
    try {
      const schoolId = req.params.schoolId;
      const referenceParams: ViewBehaviourReferenceParams =
        req.query as unknown as ViewBehaviourReferenceParams;
      const behaviour = await this.behaviourModels.viewBehaviourQuery(referenceParams, schoolId);
      res.status(StatusCodes.OK).json(behaviour);
    } catch (error) {
      next(error);
    }
  };
}
