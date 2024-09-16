import sendEmail from "../../../configurations/handlebars";
import transporter from "../../../configurations/transporter";
import { InternalServerError } from "../../../errors/InternalServerError";

export class SchoolEmails {
  public blastSchoolVerificationTokenMessage = async (data: any) => {
    const mailTransporter = transporter();
    try {
      await sendEmail({
        template: "school-otp",
        context: {
          ...data,
        },
        to: data.email,
        from: "guident.team@gmail.com",
        subject: "Email verification token",
        transporter: mailTransporter,
      });
    } catch (error: any) {
      console.error(error);
      throw new InternalServerError(error.message);
    }
  };

  public blastSchoolLoginMessage = async (data: any) => {
    const mailTransporter = transporter();
    try {
      await sendEmail({
        template: "login-school-alert",
        context: {
          ...data,
        },
        to: data.email,
        from: "guident.team@gmail.com",
        subject: "Login alert",
        transporter: mailTransporter,
      });
      return "Email sent successfully!";
    } catch (error: any) {
      console.error(error);
      throw new InternalServerError(error.message);
    }
  };

  public blastSchoolSuccessfulEmailVerificationMessage = async (data: any) => {
    const mailTransporter = transporter();
    try {
      await sendEmail({
        template: "school-email-verified",
        context: {
          ...data,
        },
        to: data.email,
        from: "guident.team@gmail.com",
        subject: "Email is verified successfully",
        transporter: mailTransporter,
      });
    } catch (error: any) {
      console.error(error);
      throw new InternalServerError(error.message);
    }
  };
  public blastSchoolRegistrationMessage = async (data: any) => {
    const mailTransporter = transporter();
    try {
      await sendEmail({
        template: "signup-school",
        context: {
          ...data,
        },
        to: data.email,
        from: "guident.team@gmail.com",
        subject: "Welcome",
        transporter: mailTransporter,
      });
    } catch (error: any) {
      console.error(error);
      throw new InternalServerError(error.message);
    }
  };
  public BlastStudentAccountEmailSuccessMessage = async (data: any) => {
    const mailTransporter = transporter();
    try {
      await sendEmail({
        template: "student-account",
        context: {
          ...data,
        },
        to: data.email,
        from: "guident.team@gmail.com",
        subject: "Student account created successfully",
        transporter: mailTransporter,
      });
    } catch (error: any) {
      console.error(error);
      throw new InternalServerError(error.message);
    }
  };
  public BlastAdmitStudentEmailSuccessMessage = async (data: any) => {
    const mailTransporter = transporter();
    try {
      await sendEmail({
        template: "admit-student",
        context: {
          ...data,
        },
        to: data.email,
        from: "guident.team@gmail.com",
        subject: "Student admission",
        transporter: mailTransporter,
      });
    } catch (error: any) {
      console.error(error);
      throw new InternalServerError(error.message);
    }
  };
}
