import nodemailer from "nodemailer";
import { google } from "googleapis";
import dotenv from "dotenv";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { config } from "./config";
dotenv.config();
const auth2 = new google.auth.OAuth2(
  config.google.GOOGLE_CLIENTID,
  config.google.GOOGLE_SECRET_KEY,
  config.google.GOOGLE_REDIRECT_URL
);

auth2.setCredentials({ refresh_token: config.google.GOOGLE_REFRESH_TOKEN });

const transporter = async (): Promise<nodemailer.Transporter<SMTPTransport.SentMessageInfo>> => {
  const accessToken = await auth2.getAccessToken();
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.G_MAIL as string,
      clientId: config.google.GOOGLE_CLIENTID as string,
      clientSecret:config.google. GOOGLE_SECRET_KEY as string,
      refreshToken: config.google.GOOGLE_REFRESH_TOKEN as string,
      accessToken: accessToken as string,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  return transporter
};

export default transporter;
