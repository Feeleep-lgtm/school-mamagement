import sendEmail from "../../../configurations/handlebars";
import transporter from "../../../configurations/transporter";
import { throwError } from "../../../helpers/ControllerError";

export class SchoolTeacherEmails {
  public blastTeacherInvitationSuccessMessage = async (data: any) => {
    const mailTransporter = transporter();
    try {
      const res = await sendEmail({
        template: "teacher-invite-success",
        context: {
          ...data,
        },
        to: data.email,
        from: "guident.team@gmail.com",
        subject: "You are onboard",
        transporter: mailTransporter,
      });
      console.log("Email sent successfully!");
      return res;
    } catch (error: any) {
      console.error(error);
      throwError(error.message, 400);
    }
  };
  public blastTeacherInvite = async (data: any) => {
    const mailTransporter = transporter();
    try {
      const inviteLink = `http:localhost:3000?/invitation/token=${data.token}&schoolId=${data.schoolId}`;
      const res = await sendEmail({
        template: "teacher-invite",
        context: {
          ...data,
          inviteLink,
        },
        to: data.email,
        from: "guident.team@gmail.com",
        subject: "Teacher Invitation Message",
        transporter: mailTransporter,
      });
      console.log("Email sent successfully!");
      return res;
    } catch (error: any) {
      console.error(error);
      throwError(error.message, 400);
    }
  };
}

