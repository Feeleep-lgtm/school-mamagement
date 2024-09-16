import { RequestHandler } from "express";
import prisma from "../../../database/PgDB";
import crypto from "crypto";
import { BadRequestError } from "../../../errors";
import { ServerUtils } from "../../../helpers/utils";
import { SchoolTeacherEmails } from "../emails/emails";
import { UserRepository } from "../../../shared/repository/userRepository";

export class SchoolTeacherInvitation {
  private userRepository = new UserRepository();
  private teacherEmails = new SchoolTeacherEmails();
  private utils = new ServerUtils();
  public inviteTeacher: RequestHandler = async (req, res, next) => {
    const { email } = req.body;
    const { schoolId } = req.params;
    try {
      const findSchool = await this.userRepository.findSchoolByUserId(schoolId);
      const findTeacher = await this.userRepository.findTeacherByUserId(
        (
          await this.userRepository.findUserByEmail(email)
        ).id
      );
      const doesTeacherSchoolInviteExist = await prisma.teacherInvite.findFirst({
        where: { teacherId: findTeacher?.id, schoolId: findSchool.id },
      });
      if (doesTeacherSchoolInviteExist) {
        throw new BadRequestError("Invitation already sent for this teacher");
      }
      const token = crypto.randomBytes(200).toString("hex");
      const newInvitation = await prisma.teacherInvite.create({
        data: {
          teacherId: findTeacher?.id as string,
          schoolId: findSchool.id,
          token: token,
          expiresAt: new Date(),
        },
      });
      if (!newInvitation) {
        throw new Error("Invite failed");
      }
      await this.teacherEmails.blastTeacherInvite({
        email,
        token,
        schoolName: findSchool.schoolName,
        schoolId: findSchool.id,
      });
      res.status(201).json({ message: "Teacher invite sent" });
    } catch (error) {
      next(error);
    }
  };
  public acceptInvite: RequestHandler = async (req, res, next) => {
    try {
      const { teacherId, schoolId } = req.params;
      const { token } = req.body;
      const findSchool = await this.userRepository.findSchoolByUserId(schoolId);
      const findTeacher = await this.userRepository.findTeacherByUserId(teacherId);
      const invite = await prisma.teacherInvite.findUnique({
        where: { teacherId: findTeacher.id },
      });
      if (!invite) {
        throw new Error("Invite not found");
      }
      if (invite.accepted) {
        throw new BadRequestError("Invite already accepted");
      }
      if (invite?.token !== token) {
        throw new Error("Invalid token");
      }
      const dateElapseTime = this.utils.diff_minutes(invite.expiresAt, new Date());
      if (dateElapseTime > 60) {
        throw new BadRequestError("Invitation expired, try again");
      }
      await prisma.teacherSchool.create({
        data: {
          schoolId: findSchool.id,
          teacherId: findTeacher.id,
        },
      });
      await prisma.teacherInvite.update({
        where: { teacherId: findTeacher.id },
        data: { accepted: true, token: "" },
      });
      await this.teacherEmails.blastTeacherInvitationSuccessMessage({
        email: findTeacher.user.email,
        schoolName: findSchool.schoolName,
        teacherName: `${findTeacher?.firstName} ${findTeacher?.lastName}`,
      });
      res.status(200).json({
        message: "Teacher has accepted the invite",
      });
    } catch (error) {
      next(error);
    }
  };
  public deleteInvitation: RequestHandler = async (req, res, next) => {
    const { schoolId, teacherId } = req.params;
    try {
      const school = await this.userRepository.findSchoolByUserId(schoolId);
      const teacher = await this.userRepository.findTeacherByUserId(teacherId);
      const doesTeacherSchoolInviteExist = await prisma.teacherInvite.findFirst({
        where: { teacherId: teacher.id, schoolId: school.id },
      });
      if (!doesTeacherSchoolInviteExist) {
        throw new BadRequestError("Invitation does not exits");
      }
      await prisma.teacherInvite.delete({ where: { teacherId: teacher.id } });
      res.status(200).json({ message: "Invitation deleted" });
    } catch (error) {
      next(error);
    }
  };
  public fetchInvitations: RequestHandler = async (req, res, next) => {
    const { schoolId } = req.params;
    try {
      const school = await this.userRepository.findSchoolByUserId(schoolId);
      const invitations = await prisma.teacherInvite.findMany({
        where: { schoolId: school.id },
        include: {
          teacher: true,
        },
      });
      res.status(200).json({ message: "Invitation deleted", data: invitations });
    } catch (error) {
      next(error);
    }
  };
}
