import prisma from "../../database/PgDB";
import { BadRequestError, NotFoundError } from "../../errors";

export class UserRepository {
  public findUserByEmail = async (email: string) => {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        school: true,
        teacher: true,
        parent: true,
      },
    });
    if (!user) {
      throw new NotFoundError("User does not exist");
    }
    return user;
  };
  public doesUserExitsByEmail = async (email: string) => {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        school: true,
        teacher: true,
        parent: true,
      },
    });
    if (user) {
      throw new BadRequestError("This is email is taken by another user");
    }
    return user;
  };
  public doesUserExitsById = async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        school: {
          select: {
            id: true,
          },
        },
      },
    });
    if (user) {
      throw new BadRequestError("User already exist");
    }
    return user;
  };
  public findUserById = async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        school: {
          select: {
            id: true,
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundError("User does not exist");
    }
    return user;
  };
  public findSchoolByUserId = async (userId: string) => {
    const school = await prisma.school.findUnique({
      where: { userId: userId },
      include: {
        user: true,
      },
    });
    if (!school) {
      throw new NotFoundError("School user not found");
    }
    return school;
  };
  public findParentByUserId = async (userId: string) => {
    const parent = await prisma.parent.findUnique({
      where: { userId: userId },
      include: {
        user: true,
        children: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            otherName: true,
            nationality: true,
            stateOfOrigin: true,
            localGovernmentArea: true,
            profilePicture: true,
            imageUrl: true,
            userName: true,
            createdAt: true,
            parentId: true,
            schools: true,
          },
        },
      },
    });
    if (!parent) {
      throw new NotFoundError("Parent user not found");
    }
    return parent;
  };
  public findTeacherByUserId = async (userId: string) => {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: userId },
      include: {
        user: true,
      },
    });
    if (!teacher) {
      throw new NotFoundError("Teacher user not found");
    }
    return teacher;
  };
  public async getSchoolWithAllRelations(userId: string) {
    const school = await prisma.school.findUnique({
      where: {
        userId: userId,
      },
      include: {
        user: true,
        students: true,
        teacherSchool: true,
      },
    });
    if (!school) {
      throw new NotFoundError("School with the provided ID was not found");
    }
    return school;
  }
}
