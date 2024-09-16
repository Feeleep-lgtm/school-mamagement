import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { UserRepository } from "../../../shared/repository/userRepository";
import prisma from "../../../database/PgDB";
import { ServerUtils } from "../../../helpers/utils";

export class ParentManagement {
  private utils = new ServerUtils();
  private userRepository = new UserRepository();
  public deactivateAccount: RequestHandler = async (req, res, next) => {
    try {
      const parentId = (await this.userRepository.findParentByUserId(req.params.parentId)).userId;
      await prisma.user.update({
        where: {
          id: parentId,
        },
        data: {
          status: "BLOCKED",
        },
      });
      res.status(StatusCodes.OK).json({ message: "Account deleted successfully" });
    } catch (error) {
      next(error);
    }
  };

  public parentStudentSchoolDetails: RequestHandler = async (req, res, next) => {
    try {
      const parentId = (await this.userRepository.findParentByUserId(req.params.parentId)).userId;
      const parent = await prisma.parent.findUnique({
        where: { userId: parentId },
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
              schools: {
                select: {
                  school: {
                    select: {
                      user: true,
                      assessments: true,
                    },
                  },
                  studentAcademicSessions: true,
                },
              },
            },
          },
        },
      });
      res.status(StatusCodes.OK).json({ message: "Fetched successfully", parent });
    } catch (error) {
      next(error);
    }
  };
}
