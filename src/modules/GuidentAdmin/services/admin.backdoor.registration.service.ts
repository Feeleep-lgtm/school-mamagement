import { RequestHandler } from "express";
import { generateUsername } from "unique-username-generator";
import { ServerUtils } from "../../../helpers/utils";
import prisma from "../../../database/PgDB";
import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "../../../errors";

export class AdminBackDoorRegistration {
  private utils = new ServerUtils();
  public createParentBackdoorAccount: RequestHandler = async (req, res, next) => {
    const { password, email } = req.body;
    try {
      const response = await prisma.$transaction(async (tx) => {
        const findParent = await tx.user.findUnique({
          where: {
            email: email,
          },
        });
        if (findParent) {
          throw new BadRequestError("This is email is taken by another user");
        }
        const findParentByPhoneNumber = await tx.parent.findUnique({
          where: {
            parentPhoneNumber: req.body.parentPhoneNumber,
          },
        });
        if (findParentByPhoneNumber) {
          throw new BadRequestError("This is phone number is taken by another user");
        }
        const username = generateUsername("", 3, 8);
        const hashedPassword = await this.utils.hashPassword(password);
        const parent = await tx.user.create({
          data: {
            email: email,
            password: hashedPassword,
            isEmailVerified: true,
            userType: "parent",
            userName: username,
            profileCompleted: true,
            avatar: this.utils.generateAvatar(email),
            profilePicture: this.utils.generateAvatar(email),
            status: "ACTIVE",
          },
        });
        await tx.parent.create({
          data: {
            occupation: req.body.occupation,
            parentPhoneNumber: req.body.parentPhoneNumber,
            parentAddress: req.body.parentAddress,
            userId: parent.id,
            fullName: req.body.fullName,
          },
        });
        return { data: { password, username } };
      });
      res
        .status(StatusCodes.ACCEPTED)
        .json({ message: "Parent account created successfully", data: response.data });
    } catch (error) {
      next(error);
    }
  };
}
