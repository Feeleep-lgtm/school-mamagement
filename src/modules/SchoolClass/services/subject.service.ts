import { RequestHandler } from "express";
import prisma from "../../../database/PgDB";
import { SchoolClassSubjectModels } from "../application/class.model";
import { BadRequestError } from "../../../errors";
import { InternalServerError } from "../../../errors/InternalServerError";
import { UserRepository } from "../../../shared/repository/userRepository";

export class SchoolClassSubject extends SchoolClassSubjectModels {
  private userRepository = new UserRepository();
  private classModel = new SchoolClassSubjectModels();
  public createSubject: RequestHandler = async (req, res, next) => {
    try {
      const classId = req.query.classId as string;
      const subject = req.body.subject as string;
      const { schoolId } = req.params;
      const findSchool = await this.userRepository.findSchoolByUserId(schoolId);
      const findClass = await this.classModel.findClass(classId);
      const findSubject = await prisma.classSubject.findFirst({
        where: { subject: subject.toLowerCase(), classId: findClass.id },
      });
      if (findSubject) {
        throw new BadRequestError("Subject already exits");
      }
      const newSubject = await prisma.classSubject.create({
        data: {
          subject: subject.toLowerCase(),
          schoolId: findSchool.id,
          classId,
        },
      });
      return res.status(201).json(newSubject);
    } catch (error: any) {
      next(error);
    }
  };
  public updateClassSubject: RequestHandler = async (req, res, next) => {
    try {
      const { schoolId, classId, subjectId } = req.params;
      const { subject } = req.body;
      const findSchool = await this.userRepository.findSchoolByUserId(schoolId);
      const classSubject = await this.findSubjectClass(subjectId, classId, findSchool.id);
      if (!classSubject) {
        throw new BadRequestError("Class subject not found");
      }
      const updatedSubject = await prisma.classSubject.update({
        where: { id: classSubject.id },
        data: { subject: subject.toLowerCase() },
      });
      if (!updatedSubject) {
        throw new InternalServerError("Server error");
      }
      res.status(200).json({ message: "Updated" });
    } catch (error: any) {
      next(error);
    }
  };

  public getSubjects: RequestHandler = async (req, res, next) => {
    try {
      const { schoolId } = req.params;
      const findSchool = await this.userRepository.findSchoolByUserId(schoolId);
      const subjects = await prisma.classSubject.findMany({
        where: {
          schoolId: findSchool.id,
        },
      });
      return res.status(200).json(subjects);
    } catch (error: any) {
      next(error);
    }
  };
}
