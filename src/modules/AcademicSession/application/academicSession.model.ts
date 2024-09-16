import { StatusCodes } from "http-status-codes";
import prisma from "../../../database/PgDB";
import { throwError } from "../../../helpers/ControllerError";

export class AcademicSessionModel {
  public async findAcademicSessionById(id: string) {
    const academicSession = await prisma.academicSession.findUnique({
      where: {
        id: id,
      },
      include: {
        school: true,
        classes: {
          select: {
            class: true,
          },
        },
      },
    });
    if (!academicSession) {
      throwError(
        "AcademicSession with the provided ID and school ID was not found",
        StatusCodes.NOT_FOUND
      );
    }
    return academicSession;
  }
  public async getAcademicSessionNameAndSchoolId(name: string) {
    const academicSession = await prisma.academicSession.findFirst({
      where: {
        sessionName: name,
      },
      include: {
        school: true,
        classes: {
          select: {
            class: true,
          },
        },
      },
    });
    if (!academicSession) {
      throwError(
        "AcademicSession with the provided ID and school ID was not found",
        StatusCodes.NOT_FOUND
      );
    }
    return academicSession;
  }
  public async getAcademicSessionByIdCurrentAndSchoolId(id: string) {
    const academicSession = await prisma.academicSession.findFirstOrThrow({
      where: {
        id: id,
        current: true,
      },
      include: {
        school: true,
      },
    });
    if (!academicSession) {
      throwError(
        "AcademicSession with the provided ID, current status, and school ID was not found OR you can only access current valid academic session",
        StatusCodes.NOT_FOUND
      );
    }
    return academicSession;
  }
  public async rejectAcademicSessionQueryIfCurrentFound(schoolId: string) {
    const academicSession = await prisma.academicSession.findFirst({
      where: {
        current: true,
        schoolId: schoolId,
      },
    });
    if (academicSession) {
      throwError(
        "You have to end current academic session to create new one",
        StatusCodes.NOT_FOUND
      );
    }
    return academicSession;
  }
  public async rejectAcademicSessionTermQueryIfCurrentFound(schoolId: string) {
    const academicSession = await prisma.academicSessionTerm.findFirst({
      where: {
        current: true,
        schoolId: schoolId,
      },
    });
    if (academicSession) {
      throwError(
        "You have to end current academic session term to create new one",
        StatusCodes.NOT_FOUND
      );
    }
    return academicSession;
  }
  public async getAllAcademicSessions(schoolId: string) {
    return await prisma.academicSession.findMany({
      where: {
        schoolId: schoolId,
      },
      include: {
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
        classes: {
          select: {
            class: {
              select: {
                id: true,
                subjects: true,
                className: true,
                createdAt: true,
                company: true,
                schoolId: true,
                updatedAt: true,
              },
            },
          },
        },
        assessments: true,
        academicSessionTerms: {
          include: {
            financialTypes: true,
          },
        },
        behaviours: true,
        financialRecords: true,
        schoolStudentSkills: true,
        schoolAssignments: true,
        schoolAnnouncements: true,
        financialTypes: {
          include: {
            academicSessionTerm: {
              select: {
                financialTypes: true,
              },
            },
          },
        },
      },
    });
  }
}
