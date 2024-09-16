import { RequestHandler } from "express";
import { ServerUtils } from "../../../helpers/utils";
import prisma from "../../../database/PgDB";
import { StatusCodes } from "http-status-codes";
import { TeacherEmails } from "../emails/teacher-emails";
import { BadRequestError } from "../../../errors";
import { InternalServerError } from "../../../errors/InternalServerError";
import { UserRepository } from "../../../shared/repository/userRepository";

export class TeacherAuthService {
  private utils = new ServerUtils();
  private userRepository = new UserRepository();
  private teacherEmails = new TeacherEmails();
  public signup: RequestHandler = async (req, res, next) => {
    const body = req.body;
    try {
      await this.userRepository.doesUserExitsByEmail(body.email);
      const hashedPassword = await this.utils.hashPassword(body.password);
      const createTeacherAccount = await prisma.user.create({
        data: {
          password: hashedPassword,

          email: body.email.toLowerCase(),
          isEmailVerified: false,
          profileCompleted: true,
          userType: "teacher",
          avatar: this.utils.generateAvatar(body.email),
        },
      });
      await this.teacherEmails.blastSignupEmailMessage({
        email: createTeacherAccount.email,
      });
      const token = this.utils.generateOTP();
      await prisma.userToken.upsert({
        where: {
          id: createTeacherAccount.id,
        },
        create: {
          token: token,
          tokenGeneratedTime: new Date(),
          userId: createTeacherAccount.id,
        },
        update: {
          token: token,
          tokenGeneratedTime: new Date(),
        },
      }),
        await this.teacherEmails.blastVerificationOtpMessage({
          email: createTeacherAccount.email,
          token: token,
        }),
        res.status(StatusCodes.CREATED).json({
          message: "Account created successfully",
        });
    } catch (error) {
      next(error);
    }
  };
  public onboarding: RequestHandler = async (req, res, next) => {
    const body = req.body;
    const { teacherId } = req.params;
    try {
      await this.userRepository.findUserById(teacherId);
      const createTeacherAccount = await prisma.teacher.upsert({
        where: {
          userId: teacherId,
        },
        create: {
          firstName: body.firstName,
          lastName: body.lastName,
          address: body.address,
          phoneNumber: body.phoneNumber,
          userId: teacherId,
        },
        update: {
          firstName: body.firstName,
          lastName: body.lastName,
          address: body.address,
          phoneNumber: body.phoneNumber,
        },
      });
      if (!createTeacherAccount) {
        throw new InternalServerError("Failed to update profile. Please try again");
      }
      await prisma.user.update({
        where: { id: teacherId },
        data: { profileCompleted: true, status: "ACTIVE" },
      });
      res.status(StatusCodes.CREATED).json({
        message: "Profile updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };
  public requestToken: RequestHandler = async (req, res, next) => {
    const { email } = req.body;
    try {
      const findTeacher = await this.userRepository.findUserByEmail(email);
      const token = this.utils.generateOTP();
      await prisma.userToken.upsert({
        where: { userId: findTeacher.id },
        create: {
          token: token,
          tokenGeneratedTime: new Date(),
          userId: findTeacher.id,
        },
        update: {
          token: token,
          tokenGeneratedTime: new Date(),
        },
      }),
        await this.teacherEmails.blastVerificationOtpMessage({
          email: findTeacher.email,
          token: token,
        }),
        res.status(StatusCodes.OK).json({
          message: "OTP sent successfully",
        });
    } catch (error) {
      next(error);
    }
  };
  public verifyEmail: RequestHandler = async (req, res, next) => {
    const email = req.body.email;
    const token = req.body.token;
    try {
      const findTeacher = await this.userRepository.findUserByEmail(email);
      if (findTeacher?.isEmailVerified) {
        throw new BadRequestError("This email is already verified");
      }
      const findToken = await prisma.userToken.findUnique({
        where: { token: token },
      });
      if (!findToken) throw new BadRequestError("Request a new token");
      const dateElapseTime = this.utils.diff_minutes(findToken?.tokenGeneratedTime!, new Date());
      if (dateElapseTime > 10) {
        throw new BadRequestError("Token expired, try again");
      } else {
        await prisma.userToken.delete({
          where: {
            userId: findTeacher.id,
          },
        });
        await prisma.user.update({
          where: {
            id: findTeacher.id,
          },
          data: {
            isEmailVerified: true,
          },
        });
      }
      res.status(StatusCodes.OK).json({
        message: "Email verified successfully",
      });
    } catch (error) {
      next(error);
    }
  };
  public login: RequestHandler = async (req, res, next) => {
    const { email, password } = req.body;
    try {
      const findTeacher = await this.userRepository.findUserByEmail(email);
      if (findTeacher.userType !== "teacher") {
        throw new BadRequestError("Permission denied. Use a teacher login details");
      }
      if (!findTeacher.isEmailVerified) {
        throw new BadRequestError("Please verify your email address");
      }
      const isPasswordValid = await this.utils.validatePassword(
        password,
        findTeacher.password as string
      );
      if (!isPasswordValid) {
        throw new BadRequestError("Invalid password");
      }
      const token = this.utils.createToken(findTeacher.id as string);
      const teacherCredentials = {
        token,
        teacherUserId: findTeacher?.id,
        isEmailVerified: true,
      };
      res.status(StatusCodes.OK).json({
        message: "Login successfully",
        data: teacherCredentials,
      });
    } catch (error) {
      next(error);
    }
  };
  public forgetPassword: RequestHandler = async (req, res, next) => {
    const { email } = req.body;
    try {
      const findTeacher = await this.userRepository.findUserByEmail(email);
      const token = this.utils.generateOTP();
      await prisma.userToken.upsert({
        where: { userId: findTeacher.id },
        create: {
          token: token,
          tokenGeneratedTime: new Date(),
          userId: findTeacher.id,
        },
        update: {
          token: token,
          tokenGeneratedTime: new Date(),
        },
      }),
        await this.teacherEmails.blastVerificationOtpMessage({
          email: findTeacher.email,
          fullName: `${findTeacher?.teacher?.firstName} ${findTeacher.teacher?.lastName}`,
        }),
        res.status(StatusCodes.OK).json({
          message: "Please check your email for token verification",
        });
    } catch (error) {
      next(error);
    }
  };
  public resetPassword: RequestHandler = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    try {
      const findEmailAddress = await this.userRepository.findUserByEmail(email);
      if (!findEmailAddress) {
        return next(new Error("Teacher not found"));
      }
      const hashPassword = await this.utils.hashPassword(password);
      await prisma.user.update({
        where: {
          id: findEmailAddress.id,
        },
        data: { password: hashPassword },
      });
      res.status(StatusCodes.OK).json({
        message: "Password updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}
