import { RequestHandler } from "express";
import { ServerUtils } from "../../../helpers/utils";
import { SchoolEmails } from "../../School/emails/emails";
import prisma from "../../../database/PgDB";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../../errors";
import { InternalServerError } from "../../../errors/InternalServerError";
import { StatusCodes } from "http-status-codes";
import { AcademicSessionModel } from "../../AcademicSession/application/academicSession.model";
import { AcademicSessionTermModel } from "../../Term/application/term.model";
import { SchoolClassSubjectModels } from "../../SchoolClass/application/class.model";
import { UserRepository } from "../../../shared/repository/userRepository";
import { CloudinaryFunctions } from "../../../helpers/cloudinary";

export class StudentService extends CloudinaryFunctions {
  private userRepository = new UserRepository();
  private utils = new ServerUtils();
  private emails = new SchoolEmails();
  private academicSession = new AcademicSessionModel();
  private academicSessionTerm = new AcademicSessionTermModel();
  private schoolClass = new SchoolClassSubjectModels();
  public createStudent: RequestHandler = async (req, res, next) => {
    const payload = req.body;
    try {
      const result = await prisma.$transaction(
        async (tx) => {
          const parent = await tx.user.findUnique({
            where: {
              email: payload.email,
            },
            include: {
              parent: true,
            },
          });
          if (!parent) {
            throw new NotFoundError("Parent not found or registered");
          }
          if (!parent.isEmailVerified) {
            throw new ForbiddenError("This parent is not authorized until email is verify");
          }
          if (!parent.profileCompleted) {
            throw new ForbiddenError("This parent exist but need to complete profile registration");
          }
          const findStudent = await tx.student.findFirst({
            where: {
              parentId: parent.parent?.id,
              firstName: payload.firstName,
              lastName: payload.lastName,
            },
          });
          if (findStudent) {
            throw new BadRequestError(
              "This parent already has a child with the information provided"
            );
          }
          const userName = this.utils.generateUsername(payload.lastName);
          const createStudent = await tx.student.create({
            data: {
              firstName: payload.firstName,
              lastName: payload.lastName,
              otherName: payload.otherName ?? "",
              nationality: payload.nationality,
              dateOfBirth: payload.dateOfBirth,
              stateOfOrigin: payload.stateOfOrigin,
              localGovernmentArea: payload.localGovernmentArea,
              userName: userName,
              profilePicture: payload.secure_url,
              imageUrl: payload.public_id,
              parentId: parent.parent?.id,
            },
          });
          if (!createStudent) {
            throw new InternalServerError("Error encountered while creating student");
          }
          await this.emails.BlastStudentAccountEmailSuccessMessage({
            email: payload.email,
            userName: userName,
          });
          return { userName };
        },
        {
          maxWait: 8000,
          timeout: 10000,
        }
      );
      res.status(StatusCodes.CREATED).json({
        message: "Student account created successfully",
        data: { userName: result.userName },
      });
    } catch (error) {
      next(error);
    }
  };
  public uploadStudentProfilePicture: RequestHandler = async (req, res, next) => {
    try {
      const student = await prisma.student.findUnique({ where: { id: req.params.studentId } });
      if (!student) {
        throw new NotFoundError("Student account not found");
      }
      if (!req.file?.path) {
        throw new BadRequestError("Image path is required");
      }
      const upload = await this.uploadImage(req.file?.path as string);
      await prisma.student.update({
        where: {
          id: req.params.studentId,
        },
        data: {
          profilePicture: upload.secure_url,
          imageUrl: upload.public_id,
        },
      });
      res
        .status(StatusCodes.CREATED)
        .json({ message: "Profile picture uploaded successfully", data: upload });
    } catch (error) {
      next(error);
    }
  };
  public updateStudent: RequestHandler = async (req, res, next) => {
    try {
      const payload = req.body;
      const student = await prisma.student.findUnique({ where: { id: req.params.studentId } });
      if (!student) {
        throw new NotFoundError("Student account not found");
      }
      const updateStudent = await prisma.student.update({
        where: {
          id: req.params.studentId,
        },
        data: {
          firstName: payload.firstName,
          lastName: payload.lastName,
          otherName: payload.otherName,
          nationality: payload.nationality,
          dateOfBirth: payload.dateOfBirth,
          stateOfOrigin: payload.stateOfOrigin,
          localGovernmentArea: payload.localGovernmentArea,
        },
      });
      if (!updateStudent) {
        throw new InternalServerError("Failed too update student");
      }
      res.status(StatusCodes.OK).json({ message: "Updated" });
    } catch (error) {
      next(error);
    }
  };
  public admitStudent: RequestHandler = async (req, res, next) => {
    await this.academicSession.findAcademicSessionById(req.body.academicSessionId);
    await this.academicSessionTerm.findAcademicSessionTermById(req.body.academicSessionTermId);
    await this.schoolClass.findClass(req.body.classId);
    try {
      await prisma.$transaction(
        async (tx) => {
          const findStudent = await tx.student.findFirst({
            where: {
              id: req.body.studentId,
            },
            include: {
              parent: {
                select: {
                  user: {
                    select: {
                      email: true,
                    },
                  },
                },
              },
            },
          });
          if (!findStudent) {
            throw new NotFoundError("Student account does not exist");
          }
          const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
          const isStudentAdmitted = await tx.schoolStudent.findFirst({
            where: {
              studentId: findStudent.id,
              schoolId: school.id,
            },
          });
          if (isStudentAdmitted) {
            throw new Error("Student already admitted");
          }
          const studentAcademicSession = await tx.schoolStudent.create({
            data: {
              studentId: findStudent.id,
              schoolId: school.id,
              status: "ACTIVE",
            },
          });
          const createStudentAcademicSession = await tx.studentAcademicSession.create({
            data: {
              academicSessionId: req.body.academicSessionId,
              academicSessionTermId: req.body.academicSessionTermId,
              classId: req.body.classId,
              schoolId: school.id,
              schoolStudentId: studentAcademicSession.id,
            },
          });
          if (!createStudentAcademicSession) {
            throw new InternalServerError("Failed to admit student");
          }
          await this.emails.BlastAdmitStudentEmailSuccessMessage({
            email: findStudent.parent?.user.email,
            studentName: `${findStudent.firstName} ${findStudent.lastName}`,
            schoolName: school.schoolName,
          });
        },
        {
          maxWait: 9000,
          timeout: 10000,
        }
      );
      res.status(StatusCodes.OK).json({ message: "Student admitted successfully" });
    } catch (error: any) {
      next(error);
    }
  };

  public searchStudent: RequestHandler = async (req, res, next) => {
    try {
      const student = await prisma.student.findMany({
        where: {
          AND: [
            {
              OR: [
                { parent: { user: { email: req.body.studentIdentity } } },
                { parent: { parentPhoneNumber: req.body.studentIdentity } },
                { userName: req.body.studentIdentity },
              ],
            },
          ],
        },
        include: {
          parent: {
            select: { fullName: true, parentPhoneNumber: true, occupation: true, user: true },
          },
        },
      });
      res.status(StatusCodes.OK).json({ student });
    } catch (error: any) {
      next(error);
    }
  };
  public students: RequestHandler = async (req, res, next) => {
    try {
      const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
      const students = await prisma.schoolStudent.findMany({
        where: { schoolId: school.id },
        include: {
          student: true,
          studentAcademicSessions: {
            select: {
              id: true,
              student: true,
              academicSession: true,
              academicSessionTerm: true,
              studentAcademicSessionResults: true,
              class: {
                select: {
                  id: true,
                  schoolId: true,
                  className: true,
                  subjects: true,
                },
              },
            },
          },
        },
      });
      res.status(StatusCodes.OK).json({ message: "Fetched!", data: students });
    } catch (error) {
      next(error);
    }
  };
}
