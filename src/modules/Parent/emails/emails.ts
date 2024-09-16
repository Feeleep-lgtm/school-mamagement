import sendEmail from "../../../configurations/handlebars";
import transporter from "../../../configurations/transporter";
import { InternalServerError } from "../../../errors/InternalServerError";

export class ParentEmails {
    public blastParentVerificationTokenMessage = async (data: any) => {
      const mailTransporter = transporter();
      try {
        await sendEmail({
          template: "parent-otp",
          context: {
            ...data,
          },
          to: data.email,
          from: "guident.team@gmail.com",
          subject: "Email verification token for parent",
          transporter: mailTransporter,
        });
        console.log("Email sent successfully!");
      } catch (error: any) {
        console.error(error);
        throw new InternalServerError(error.message);
      }
    };
    public blastParentSuccessfulEmailVerificationMessage = async (data: any) => {
      const mailTransporter = transporter();
      try {
        await sendEmail({
          template: "parent-email-verified",
          context: {
            ...data,
          },
          to: data.email,
          from: "guident.team@gmail.com",
          subject: "Email is verified successfully",
          transporter: mailTransporter,
        });
        console.log("Email sent successfully!");
      } catch (error: any) {
        console.error(error);
        throw new InternalServerError(error.message);
      }
    };
  public blastParentRegistrationMessage = async (data: any) => {
    const mailTransporter = transporter();
    try {
      await sendEmail({
        template: "signup-parent",
        context: {
          ...data,
        },
        to: data.email,
        from: "guident.team@gmail.com",
        subject: "Welcome to guident as parent",
        transporter: mailTransporter,
      });
      console.log("Email sent successfully!");
    } catch (error: any) {
      console.error(error);
      throw new InternalServerError(error.message);
    }
  };

  // public blastParentRegistrationMessage = async (data: any) => {
  //   const mailTransporter = transporter();
  //   try {
  //     await sendEmail({
  //       template: "admit-student",
  //       context: {
  //         ...data,
  //       },
  //       to: data.email,
  //       from: "guident.team@gmail.com",
  //       subject: "Your child has been admitted.",
  //       transporter: mailTransporter,
  //     });
  //     console.log("Email sent successfully!");
  //   } catch (error: any) {
  //     console.error(error);
  //     throw new InternalServerError(error.message);
  //   }
  // };
}
