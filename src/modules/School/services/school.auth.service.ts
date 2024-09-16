import { RequestHandler } from "express";
import { ServerUtils } from "../../../helpers/utils";
import prisma from "../../../database/PgDB";
import { StatusCodes } from "http-status-codes";
import { throwError } from "../../../helpers/ControllerError";
import { BadRequestError, UnauthorizedError } from "../../../errors";
import { InternalServerError } from "../../../errors/InternalServerError";
import { SchoolEmails } from "../emails/emails";
import { UserRepository } from "../../../shared/repository/userRepository";

export class SchoolAuthLogics {
  private userRepository = new UserRepository();
  private utils = new ServerUtils();
  private schoolEmail = new SchoolEmails();

  public signup: RequestHandler = async (req, res, next) => {
    const { password, email } = req.body;
    try {
      await this.userRepository.doesUserExitsByEmail(email);
      const school = await prisma.user.create({
        data: {
          email: email,
          password: await this.utils.hashPassword(password),
          isEmailVerified: false,
          userType: "school",
          avatar: this.utils.generateAvatar(email),
          profileCompleted: false,
          status: "BLOCKED",
        },
      });
      const token = this.utils.generateOTP();
      await this.schoolEmail.blastSchoolRegistrationMessage({
        email: school.email,
      });
      const updateOtp = await prisma.userToken.upsert({
        where: { userId: school?.id },
        create: {
          token: token,
          userId: school.id,
          tokenGeneratedTime: new Date(),
        },
        update: {
          token: token,
          userId: school.id,
          tokenGeneratedTime: new Date(),
        },
      });
      await this.schoolEmail.blastSchoolVerificationTokenMessage({
        email,
        token,
      });
      if (!updateOtp) {
        throw new InternalServerError("Failed to update token");
      }
      res.status(StatusCodes.OK).json({
        message:
          "Account created successfully, please verify your email address",
      });
    } catch (error) {
      next(error);
    }
  };
  public login: RequestHandler = async (req, res, next) => {
    const { email, password } = req.body;
    try {
      const getSchoolByEmail = await this.userRepository.findUserByEmail(email);
      if (getSchoolByEmail.userType !== "school") {
        throw new BadRequestError(
          "Permission denied. Use a school login details"
        );
      }
      if (!getSchoolByEmail.isEmailVerified) {
        throw new BadRequestError("Please verify email address");
      }
      await this.utils.validatePassword(
        password,
        getSchoolByEmail.password as string
      );
      const token = this.utils.createToken(getSchoolByEmail?.id as string);
      const schoolCredentials = {
        token,
        schoolUserId: getSchoolByEmail?.id,
        isProfileCompleted: getSchoolByEmail?.profileCompleted,
        isEmailVerified: true,
      };
      res
        .status(StatusCodes.OK)
        .json({ message: "Login successfully", schoolCredentials });
    } catch (error) {
      next(error);
    }
  };
  public onboarding: RequestHandler = async (req, res, next) => {
    const { schoolId } = req.params;
    const {
      schoolName,
      schoolAddress,
      rcNumber,
      firstName,
      lastName,
      phoneNumber,
      adminPosition,
    } = req.body;
    try {
      const user = await this.userRepository.findUserById(schoolId);
      if (user?.id !== req.authId!.toString())
        throw new UnauthorizedError("You are not authorized");
      else if (!user.isEmailVerified)
        throw new BadRequestError("Please verify your email address");
      await prisma.school.upsert({
        where: {
          userId: user.id,
        },
        include: {
          user: true,
        },
        update: {
          schoolName: schoolName,
          address: schoolAddress,
          rcNumber: rcNumber,
          phoneNumber: phoneNumber,
          position: adminPosition,
          lastName: lastName,
          firstName: firstName,
        },
        create: {
          schoolName: schoolName,
          address: schoolAddress,
          rcNumber: rcNumber,
          phoneNumber: phoneNumber,
          position: adminPosition,
          lastName: lastName,
          firstName: firstName,
          userId: user.id,
        },
      });
      await prisma.user.update({
        where: { id: user.id },
        data: { profileCompleted: true, status: "ACTIVE" },
      });

      res.status(StatusCodes.OK).json({
        message: "Profile updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };
  public verifyEmailAccount: RequestHandler = async (req, res, next) => {
    const token = req.body.token;
    const email = req.body.email;
    try {
      const findSchool = await this.userRepository.findUserByEmail(email);
      if (findSchool?.isEmailVerified) {
        throwError(
          "This email is already verified",
          StatusCodes.UNPROCESSABLE_ENTITY
        );
      }
      const getToken = await prisma.userToken.findUnique({
        where: { userId: findSchool?.id },
      });
      if (getToken?.token !== token) {
        throw new BadRequestError(
          "Invalid otp provided, please request new one"
        );
      }
      const dateElapseTime = this.utils.diff_minutes(
        getToken?.tokenGeneratedTime!,
        new Date()
      );
      if (dateElapseTime > 5) {
        await prisma.userToken.delete({
          where: {
            id: getToken?.id,
          },
        });
        throwError("Token expired, try again", StatusCodes.UNAUTHORIZED);
      } else {
        await prisma.user.update({
          where: { id: findSchool?.id! },
          data: { isEmailVerified: true },
        });
        await prisma.userToken.delete({
          where: {
            id: getToken?.id,
          },
        });
        await this.schoolEmail.blastSchoolSuccessfulEmailVerificationMessage({
          email: findSchool.email,
        });
      }
      res
        .status(StatusCodes.OK)
        .json({ message: "Email verified successfully" });
    } catch (error) {
      next(error);
    }
  };
  public requestOtp: RequestHandler = async (req, res, next) => {
    try {
      const email = req.body.email as string;
      const school = await this.userRepository.findUserByEmail(email);
      if (!school) {
        throw new Error("School not found");
      }
      const token = this.utils.generateOTP();
      const updateOtp = await prisma.userToken.upsert({
        where: { userId: school?.id },
        create: {
          token: token,
          userId: school.id,
          tokenGeneratedTime: new Date(),
        },
        update: {
          token: token,
          userId: school.id,
          tokenGeneratedTime: new Date(),
        },
      });
      if (!updateOtp) {
        throwError("Failed to send opt", StatusCodes.INTERNAL_SERVER_ERROR);
      }
      await this.schoolEmail.blastSchoolVerificationTokenMessage({
        email,
        token,
      });
      res.status(StatusCodes.OK).json({ message: "Opt sent successfully" });
    } catch (error) {
      next(error);
    }
  };
  public updateSchoolPassword: RequestHandler = async (req, res, next) => {
    const token = req.body.token as string;
    const email = req.body.email as string;
    const password = req.body.password as string;
    try {
      const school = await this.userRepository.findUserByEmail(email);
      if (!school) {
        throw new Error("School not found");
      }
      const getToken = await prisma.userToken.findUnique({
        where: { userId: school?.id },
      });
      if (!getToken) {
        throw new BadRequestError("Token not found");
      }
      if (getToken?.token !== token) {
        throw new BadRequestError(
          "Invalid token provided, please request new one"
        );
      }
      const dateElapseTime = this.utils.diff_minutes(
        getToken?.tokenGeneratedTime!,
        new Date()
      );
      if (dateElapseTime > 5) {
        await prisma.userToken.delete({
          where: {
            id: getToken?.id,
          },
        });
        throw new BadRequestError("Token expired, try again");
      } else {
        await prisma.userToken.delete({
          where: {
            id: getToken?.id,
          },
        });
        const hashPassword = await this.utils.hashPassword(password);
        await prisma.user.update({
          where: {
            id: school.id,
          },
          data: {
            password: hashPassword,
          },
        });
        res
          .status(StatusCodes.OK)
          .json({ message: "Password updated successfully" });
      }
    } catch (error) {
      next(error);
    }
  };
}
