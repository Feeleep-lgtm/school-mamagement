import { StatusCodes } from "http-status-codes";
import prisma from "../../../database/PgDB";
import { throwError } from "../../../helpers/ControllerError";


export class StudentModel {
  public async getStudentById(id: string) {
    const student = await prisma.schoolStudent.findUnique({
      where: {
        id: id,
      },
      include: {
        school: true,
      },
    });
    if (!student) {
      throwError("Student with the provided ID was not found", StatusCodes.NOT_FOUND);
    }
    return student;
  }
  public async getStudentByIdName(userName: string, schoolId: string) {
    const student = await prisma.schoolStudent.findUnique({
      where: {
        id: userName,
      },
      include: {
        school: true,
      },
    });
    if (!student) {
      throwError("Student with the provided username was not found", StatusCodes.NOT_FOUND);
    }
    return student;
  }
  public async getStudentByIdAndParent(id: string) {
    const student = await prisma.student.findUnique({
      where: {
        id: id,
      },
      include: {
        parent: {
          select: { id: true },
        },
      },
    });
    if (!student) {
      throwError("Student with the provided ID and parent ID was not found", StatusCodes.NOT_FOUND);
    }
    return student;
  }
  public async getStudentByUsernameAndParent(id: string) {
    const student = await prisma.student.findUnique({
      where: {
        id: id,
      },
      include: {
        parent: {
          select: { id: true },
        },
      },
    });
    if (!student) {
      throwError(
        "Student with the provided username and parent ID was not found",
        StatusCodes.NOT_FOUND
      );
    }
    return student;
  }
}
