import { StatusCodes } from "http-status-codes";
import prisma from "../../../database/PgDB";
import { throwError } from "../../../helpers/ControllerError";

export class SchoolClassSubjectModels {
  public async getSchoolClasses(schoolId: string) {
    const classes = await prisma.schoolClass.findMany({
      where: {
        schoolId: schoolId,
      },
    });
    return classes;
  }
  public async findSubjectClass(subjectId: string, classId: string, schoolId: string) {
    const classSubject = await prisma.classSubject.findFirst({
      where: {
        AND: [{ id: subjectId }, { classId: classId }, { schoolId: schoolId }],
      },
    });
    if (!classSubject) {
      throwError("Class subject not found", StatusCodes.NOT_FOUND);
    }
    return classSubject;
  }
  public async findClass(classId: string) {
    const findClass = await prisma.schoolClass.findUnique({ where: { id: classId } });
    if (!findClass) {
      throw new Error("Class not found");
    }
    return findClass;
  }

}
