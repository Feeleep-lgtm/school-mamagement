import { RequestHandler } from "express";
import { generateUsername } from "unique-username-generator";
import prisma from "../../../database/PgDB";
import { StatusCodes } from "http-status-codes";
import { ServerUtils } from "../../../helpers/utils";
import { InternalServerError } from "../../../errors/InternalServerError";
import { ParentEmails } from "../emails/emails";
import { BadRequestError } from "../../../errors";
import { UserRepository } from "../../../shared/repository/userRepository";

export class ParentAuthService {
  private utils = new ServerUtils();
  private userRepository = new UserRepository();
  private parentEmails = new ParentEmails();
  public signup: RequestHandler = async (req, res, next) => {
    const { password, email } = req.body;
    try {
      const findParent = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });
      if (findParent) {
        throw new BadRequestError("This is email is taken by another user");
      }
      const username = generateUsername("", 3);
      const parent = await prisma.user.create({
        data: {
          email: email,
          password: await this.utils.hashPassword(password),
          isEmailVerified: false,
          userType: "parent",
          userName: username,
          profileCompleted: false,
          avatar: this.utils.generateAvatar(email),
          profilePicture: this.utils.generateAvatar(email),
        },
      });
      const token = this.utils.generateOTP();
      const updateOtp = await prisma.userToken.upsert({
        where: { userId: parent?.id },
        create: { token: token, userId: parent.id, tokenGeneratedTime: new Date() },
        update: { token: token, userId: parent.id, tokenGeneratedTime: new Date() },
      });
      await this.parentEmails.blastParentVerificationTokenMessage({ email, token });
      await this.parentEmails.blastParentRegistrationMessage({ email: parent.email });
      if (!updateOtp) {
        throw new InternalServerError("Failed to update token");
      }
      res.status(StatusCodes.OK).json({
        message: "Account created successfully, please verify your email address",
      });
    } catch (error) {
      next(error);
    }
  };
  public login: RequestHandler = async (req, res, next) => {
    const { email, password } = req.body;
    try {
      const findParent = await this.userRepository.findUserByEmail(email);
      if (findParent.userType !== "parent") {
        throw new BadRequestError("Permission denied. Use a parent login details");
      }
      if (!findParent.isEmailVerified) {
        throw new BadRequestError("Please verify email address");
      }
      await this.utils.validatePassword(password, findParent.password as string);
      const token = this.utils.createToken(findParent?.id as string);
      const parentCredentials = {
        token,
        parentUserId: findParent?.id,
        isEmailVerified: true,
        isProfileCompleted: findParent?.profileCompleted,
      };
      res.status(StatusCodes.OK).json({ message: "Login successfully", parentCredentials });
    } catch (error) {
      next(error);
    }
  };
  public verifyEmailAccount: RequestHandler = async (req, res, next) => {
    const token = req.body.token;
    const email = req.body.email;
    try {
      const findParent = await this.userRepository.findUserByEmail(email);
      if (findParent?.isEmailVerified) {
        throw new InternalServerError("This email is already verified");
      }
      const getToken = await prisma.userToken.findUnique({ where: { userId: findParent?.id } });
      if (getToken?.token !== token) {
        throw new BadRequestError("Invalid otp provided, please request new one");
      }
      const dateElapseTime = this.utils.diff_minutes(getToken?.tokenGeneratedTime!, new Date());
      if (dateElapseTime > 5) {
        await prisma.userToken.delete({
          where: {
            id: getToken?.id,
          },
        });
        throw new BadRequestError("Token expired, try again");
      } else {
        await prisma.user.update({
          where: { id: findParent?.id! },
          data: { isEmailVerified: true },
        });
        await prisma.userToken.delete({
          where: {
            id: getToken?.id,
          },
        });
        await this.parentEmails.blastParentSuccessfulEmailVerificationMessage({
          email: findParent.email,
        });
      }
      res.status(StatusCodes.OK).json({ message: "Email verified successfully" });
    } catch (error) {
      next(error);
    }
  };
  public updatePassword: RequestHandler = async (req, res, next) => {
    try {
      const email = req.body.email;
      const password = req.body.password;
      const token = req.body.token;
      const findParent = await this.userRepository.findUserByEmail(email);
      const getToken = await prisma.userToken.findUnique({ where: { userId: findParent?.id } });
      if (getToken?.token !== token) {
        throw new BadRequestError("Invalid otp provided, please request new one");
      }
      const dateElapseTime = this.utils.diff_minutes(getToken?.tokenGeneratedTime!, new Date());
      if (dateElapseTime > 5) {
        await prisma.userToken.delete({
          where: {
            id: getToken?.id,
          },
        });
        throw new BadRequestError("Token expired, try again");
      } else {
        const hashPassword = await this.utils.hashPassword(password);
        const updatePassword = await prisma.user.update({
          where: { id: findParent?.id as string },
          data: { password: hashPassword },
        });
        await prisma.userToken.delete({
          where: {
            id: getToken?.id,
          },
        });
        if (!updatePassword) throw new InternalServerError("Error updating password");
      }
      res.status(StatusCodes.OK).json({
        message: "Password updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };
  public requestOtp: RequestHandler = async (req, res, next) => {
    try {
      const email = req.body.email as string;
      const parent = await this.userRepository.findUserByEmail(email);
      const token = this.utils.generateOTP();
      const updateOtp = await prisma.userToken.upsert({
        where: { userId: parent?.id },
        create: { token: token, userId: parent.id, tokenGeneratedTime: new Date() },
        update: { token: token, userId: parent.id, tokenGeneratedTime: new Date() },
      });
      if (!updateOtp) {
        throw new InternalServerError("Failed to send otp");
      }
      await this.parentEmails.blastParentVerificationTokenMessage({ email, token });
      res.status(StatusCodes.OK).json({ message: "Otp sent successfully" });
    } catch (error) {
      next(error);
    }
  };
  public onboarding: RequestHandler = async (req, res, next) => {
    try {
      const findParent = await this.userRepository.findUserById(req.params.parentId);
      if (!findParent.isEmailVerified) {
        throw new BadRequestError("Please verify email address");
      }
      const completeOnboarding = await prisma.parent.upsert({
        where: {
          userId: findParent.id,
        },
        update: {
          occupation: req.body.occupation,
          parentPhoneNumber: req.body.parentPhoneNumber,
          parentAddress: req.body.parentAddress,
          fullName: req.body.fullName,
        },
        create: {
          occupation: req.body.occupation,
          parentPhoneNumber: req.body.parentPhoneNumber,
          parentAddress: req.body.parentAddress,
          userId: findParent.id,
          fullName: req.body.fullName,
        },
      });
      await prisma.user.update({
        where: {
          id: findParent.id,
        },
        data: {
          profileCompleted: true,
          status: "ACTIVE",
        },
      });
      if (!completeOnboarding) {
        throw new InternalServerError("Failed to update profile");
      }
      res.status(StatusCodes.OK).json({ message: "Updated successfully" });
    } catch (error) {
      next(error);
    }
  };
}
