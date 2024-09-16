import sendEmail from "../../../configurations/handlebars";
import transporter from "../../../configurations/transporter";
import { throwError } from "../../../helpers/ControllerError";


export class TeacherEmails{
    public blastSignupEmailMessage = async (data: any) => {
        const mailTransporter = transporter();
        try {
            const res = await sendEmail({
                template: "teacher-signup",
                context: {
                    ...data
                },
                to: data.email,
                from: "guident.team@gmail.com",
                subject: "Signup Success Message",
                transporter: mailTransporter,
            });
            console.log("Email sent successfully!");
            return res
        } catch (error: any) {
            console.error(error);
            throwError(error.message, 400);
        }
    };
    public blastVerificationOtpMessage = async (data: any) => {
        const mailTransporter = transporter();
        try {
            const res = await sendEmail({
                template: "teacher-otp-verification",
                context: {
                    ...data
                },
                to: data.email,
                from: "guident.team@gmail.com",
                subject: "Email Verification Message",
                transporter: mailTransporter,
            });
            console.log("Email sent successfully!");
            return res
        } catch (error: any) {
            console.error(error);
            throwError(error.message, 400);
        }
    };
}

