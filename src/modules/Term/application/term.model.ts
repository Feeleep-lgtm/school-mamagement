import prisma from "../../../database/PgDB";
import { NotFoundError } from "../../../errors";

export class AcademicSessionTermModel {
  public async findAcademicSessionTermById(id: string) {
    const academicSessionTerm = await prisma.academicSessionTerm.findUnique({
      where: {
        id: id,
      },
      include: {
        school: true,
        academicSession: true,
      },
    });

    if (!academicSessionTerm) {
      throw new NotFoundError("AcademicSessionTerm with the provided ID not found");
    }

    return academicSessionTerm;
  }

  public async getAcademicSessionTermByIdCurrentAndSchoolId(
    id: string,
    current: boolean,
    schoolId: string
  ) {
    const academicSessionTerm = await prisma.academicSessionTerm.findFirst({
      where: {
        id: id,
        current: current,
        schoolId: schoolId,
      },
      include: {
        school: true,
        academicSession: true,
      },
    });

    if (!academicSessionTerm) {
      throw new NotFoundError(
        "AcademicSessionTerm with the provided ID, current status, and school ID was not found"
      );
    }

    return academicSessionTerm;
  }
}
