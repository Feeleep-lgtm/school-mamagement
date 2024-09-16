import { RequestHandler } from "express";
import { UserRepository } from "../../../shared/repository/userRepository";
import { AcademicSessionModel } from "../../AcademicSession/application/academicSession.model";
import { AcademicSessionTermModel } from "../../Term/application/term.model";
import { SchoolClassSubjectModels } from "../../SchoolClass/application/class.model";
import prisma from "../../../database/PgDB";
import { StatusCodes } from "http-status-codes";
import { findOrCreateClassResult } from "../../../shared/functions/sharedFunctions";

export class AttendanceService {
  private userRepository = new UserRepository();
  private academicSession = new AcademicSessionModel();
  private academicSessionTerm = new AcademicSessionTermModel();
  private schoolClass = new SchoolClassSubjectModels();

  public attendance: RequestHandler = async (req, res, next) => {
    const { totalDays, absentDays, presentDays } = req.body;
    try {
      await this.academicSession.findAcademicSessionById(req.body.academicSessionId);
      await this.academicSessionTerm.findAcademicSessionTermById(req.body.academicSessionTermId);
      await this.schoolClass.findClass(req.body.classId);
      const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
      const doesAttendanceAlreadyExist = await prisma.attendance.findFirst({
        where: {
          studentAcademicSessionId: req.body.studentAcademicSessionId,
          academicSessionId: req.body.academicSessionId,
          academicSessionTermId: req.body.academicSessionTermId,
          classId: req.body.classId,
          schoolId: school.id,
        },
      });
      if (doesAttendanceAlreadyExist) {
        await prisma.attendance.update({
          where: {
            id: doesAttendanceAlreadyExist.id,
          },
          data: {
            totalDays,
            absentDays,
            presentDays,
          },
        });
      } else {
        const classResultId = await findOrCreateClassResult(
          req.body.classId,
          req.body.academicSessionId,
          req.body.academicSessionTermId,
          school.id
        );
        await prisma.attendance.create({
          data: {
            totalDays,
            absentDays,
            presentDays,
            studentAcademicSessionId: req.body.studentAcademicSessionId,
            academicSessionId: req.body.academicSessionId,
            academicSessionTermId: req.body.academicSessionTermId,
            classId: req.body.classId,
            schoolId: school.id,
            classResultId: classResultId,
          },
        });
      }
      res.status(StatusCodes.CREATED).json({ message: "Attendance/Updated created successfully" });
    } catch (error) {
      next(error);
    }
  };

  public fetchAttendance: RequestHandler = async (req, res, next) => {
    try {
      await this.academicSession.findAcademicSessionById(req.query.academicSessionId as string);
      await this.academicSessionTerm.findAcademicSessionTermById(
        req.query.academicSessionTermId as string
      );
      await this.schoolClass.findClass(req.query.classId as string);
      const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
      const records = await prisma.attendance.findMany({
        where: {
          studentAcademicSessionId: req.body.studentAcademicSessionId,
          academicSessionId: req.body.academicSessionId,
          academicSessionTermId: req.body.academicSessionTermId,
          classId: req.body.classId,
          schoolId: school.id,
        },
        include: {
          studentAcademicSession: {
            select: {
              student: {
                select: {
                  student: {
                    select: {
                      firstName: true,
                      profilePicture: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      res.status(StatusCodes.OK).json({ message: "Fetched successfully", data: records });
    } catch (error) {
      next(error);
    }
  };
}
