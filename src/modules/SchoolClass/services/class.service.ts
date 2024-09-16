import { RequestHandler } from "express";
import prisma from "../../../database/PgDB";
import { InternalServerError } from "../../../errors/InternalServerError";
import { BadRequestError } from "../../../errors";
import { UserRepository } from "../../../shared/repository/userRepository";

export class SchoolClass {
  private userRepository = new UserRepository();
  public createSchoolClass: RequestHandler = async (req, res, next) => {
    try {
      const { schoolId } = req.params;
      const findSchool = await this.userRepository.findSchoolByUserId(schoolId);
      const className = req.body.className as string;
      const result = await prisma.$transaction(async (tx) => {
        const findClass = await tx.schoolClass.findFirst({
          where: {
            className: className.toLowerCase(),
            schoolId: findSchool.id,
          },
        });
        if (findClass) {
          throw new BadRequestError("This Class is already exist in your school");
        }
        const newSchoolClass = await tx.schoolClass.create({
          data: {
            className: className.toLowerCase(),
            schoolId: findSchool.id,
          },
        });
        const findCurrentAcademicSessionBySchool = await tx.academicSession.findFirst({
          where: {
            schoolId: findSchool.id,
            current: true,
          },
        });
        if (!newSchoolClass) {
          throw new InternalServerError("Error creating class");
        }
        if (findCurrentAcademicSessionBySchool) {
          const createSchoolClassAcademicSession = await tx.schoolClassAcademicSession.create({
            data: {
              academicSessionId: findCurrentAcademicSessionBySchool?.id,
              classId: newSchoolClass.id,
              schoolId: findSchool.id,
            },
          });
          if (!createSchoolClassAcademicSession) {
            throw new InternalServerError("System error");
          }
        }
      });
      return res.status(201).json({ message: "Created!", result });
    } catch (error: any) {
      next(error);
    }
  };

  public updateSchoolClass: RequestHandler = async (req, res, next) => {
    try {
      const classId = req.query.classId as string;
      const { className } = req.body;
      const updatedSchoolClass = await prisma.schoolClass.update({
        where: {
          id: classId,
        },
        data: {
          className: className,
        },
      });
      if (!updatedSchoolClass) {
        throw new InternalServerError("");
      }
      return res.status(200).json({ message: "Updated!" });
    } catch (error: any) {
      next(error);
    }
  };

  public getSchoolClass: RequestHandler = async (req, res, next) => {
    try {
      const classId = req.query.classId as string;
      const { schoolId } = req.params;
      const findSchool = await this.userRepository.findSchoolByUserId(schoolId);
      const schoolClass = await prisma.schoolClass.findFirst({
        where: {
          id: classId,
          schoolId: findSchool.id,
        },
        include: {
          subjects: true,
        },
      });
      if (!schoolClass) {
        throw new InternalServerError("Class not found");
      }
      return res.status(200).json({ message: "Ok", data: schoolClass });
    } catch (error: any) {
      next(error);
    }
  };

  public getSchoolClasses: RequestHandler = async (req, res, next) => {
    try {
      const { schoolId } = req.params;
      const findSchool = await this.userRepository.findSchoolByUserId(schoolId);
      const schoolClasses = await prisma.schoolClass.findMany({
        where: {
          schoolId: findSchool.id,
        },
        include: {
          subjects: true,
          studentAcademicSession: {
            select: {
              id:true,
              academicSession: {
                select: {
                  current: true,
                },
              },
            },
          },
        },
      });
      return res.status(200).json({ message: "OK", data: schoolClasses });
    } catch (error: any) {
      next(error);
    }
  };

  public deleteSchoolClass: RequestHandler = async (req, res, next) => {
    try {
      const { classId } = req.params;
      await prisma.schoolClass.delete({
        where: {
          id: classId,
        },
      });
      return res.status(204).json({ message: "Class deleted successfully." });
    } catch (error) {
      next(error);
    }
  };
}
