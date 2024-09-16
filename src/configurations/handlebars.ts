import { Transporter } from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import path from "path";

const getHandlebarOptions = (): any => {
    return {
        viewEngine: {
            extName: ".handlebars",
            layoutsDir: path.resolve(__dirname, '../../views'),
            defaultLayout: false,
        },
        viewPath: path.resolve(__dirname, '../../views'),
        extName: ".handlebars",
    };
};

const useHandlebar = async (transporter: Promise<Transporter<SMTPTransport.SentMessageInfo>>) => {
    const handlebarOptions = getHandlebarOptions();
    (await transporter).use('compile', hbs(handlebarOptions));
};

const sendEmail = async (data: {
    template: string;
    context: Record<string, any>;
    to: string;
    from: string;
    subject: string;
    transporter: Promise<Transporter<SMTPTransport.SentMessageInfo>>;
}): Promise<void> => {
    try {
        await useHandlebar(data.transporter);
        const mailOptions = {
            from: data.from,
            to: data.to,
            subject: data.subject,
            template: data.template,
            context: data.context,
        };
      const i=  (await data.transporter).sendMail(mailOptions);
    } catch (error:any) {
        throw new Error("Failed to send email: " + error.message);
    }
};

export default sendEmail;
