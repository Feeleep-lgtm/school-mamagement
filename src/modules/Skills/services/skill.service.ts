import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import prisma from "../../../database/PgDB";
import { InternalServerError } from "../../../errors/InternalServerError";
import { BadRequestError, updateStudentResultError } from "../../../errors";
import { UserRepository } from "../../../shared/repository/userRepository";
import { AcademicSessionModel } from "../../AcademicSession/application/academicSession.model";
import { AcademicSessionTermModel } from "../../Term/application/term.model";
import { SchoolClassSubjectModels } from "../../SchoolClass/application/class.model";
import { findOrCreateClassResult } from "../../../shared/functions/sharedFunctions";

export class Skills {
  private userRepository = new UserRepository();
  private academicSession = new AcademicSessionModel();
  private academicSessionTerm = new AcademicSessionTermModel();
  private schoolClass = new SchoolClassSubjectModels();

  public createSkills: RequestHandler = async (req, res, next) => {
    const records = req.body.records as {
      score: number;
      studentAcademicSessionId: string;
    }[];
    try {
      const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
      await this.academicSession.findAcademicSessionById(req.body.academicSessionId);
      await this.academicSessionTerm.findAcademicSessionTermById(req.body.academicSessionTermId);
      await this.schoolClass.findSubjectClass(req.body.subjectId, req.body.classId, school.id);
      const findExistingSkills = await prisma.schoolStudentSkill.findMany({
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
          skillType: (req.body.skillType as string).toLowerCase(),
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
      const studentsWithoutSkills: string[] = findExistingSkills.map(
        (studentAcademicSession) => studentAcademicSession.studentAcademicSessionId
      );
      const getStudentsWithoutSkills = records
        .map((record) => {
          if (!studentsWithoutSkills.includes(record.studentAcademicSessionId)) {
            return record;
          }
        })
        .filter((record) => record !== undefined) as {
        score: number;
        studentAcademicSessionId: string;
      }[];
      if (!getStudentsWithoutSkills.length) {
        throw new BadRequestError(
          `All skills records already exits for this academic session, term and class and subject`
        );
      }
     const classResultId = await findOrCreateClassResult(
       req.body.classId,
       req.body.academicSessionId,
       req.body.academicSessionTermId,
       school.id
     );
      const skills = getStudentsWithoutSkills.map((record) => {
        return {
          score: record.score,
          studentAcademicSessionId: record.studentAcademicSessionId,
          schoolId: school.id,
          classId: req.body.classId,
          academicSessionId: req.body.academicSessionId,
          academicSessionTermId: req.body.academicSessionTermId,
          skillType: (req.body.skillType as string).toLowerCase(),
          classResultId: classResultId,
        };
      });
      const createSkill = await prisma.schoolStudentSkill.createMany({
        data: skills,
      });
      if (!createSkill) {
        throw new InternalServerError("Failed to create skills");
      }
      res.status(StatusCodes.CREATED).json({ message: "Skills uploaded successfully" });
    } catch (error) {
      next(error);
    }
  };
  public updateExistingAddSKills: RequestHandler = async (req, res, next) => {
    try {
      const updateRecords = req.body.records as { score: number; skillId: string }[];
      const studentIdsToCheck = updateRecords.map(
        (record: { skillId: string }) => record.skillId
      ) as string[];
      const existingStudents = await prisma.schoolStudentSkill.findMany({
        where: {
          id: {
            in: studentIdsToCheck,
          },
        },
      });
      const existingStudentSkillIds = existingStudents.map((skill) => skill);
      const nonExistingBehaviors = studentIdsToCheck.filter(
        (skillId) => !existingStudentSkillIds.map((skill) => skill.id).includes(skillId)
      );
      if (nonExistingBehaviors.length) {
        const studentNames = nonExistingBehaviors.map((skill) => {
          return {
            studentName: `${skill}`,
            skillId: skill,
          };
        });
        throw new updateStudentResultError(`The following record don't exist`, studentNames);
      }
      const updatedSkills = await Promise.all(
        updateRecords.map(async (record: { skillId: string; score: number }) => {
          const updatedResult = await prisma.schoolStudentSkill.update({
            where: {
              id: record.skillId,
            },
            data: {
              score: record.score,
            },
          });
          return updatedResult;
        })
      );
      res
        .status(StatusCodes.OK)
        .json({ message: "Skills updated successfully", data: updatedSkills });
    } catch (error) {
      next(error);
    }
  };
  public filterSkills: RequestHandler = async (req, res, next) => {
    try {
      const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
      const behaviours = await prisma.schoolStudentSkill.findMany({
        where: {
          academicSessionId: req.query.academicSessionId as string,
          academicSessionTermId: req.query.academicSessionTermId as string,
          classId: req.query.classId as string,
          schoolId: school.id,
          skillType: (req.query.skillType as string).toLowerCase(),
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
        .json({ message: "Skills fetched successfully", results: behaviours });
    } catch (error) {
      next(error);
    }
  };
}
