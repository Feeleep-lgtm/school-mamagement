import dotenv from "dotenv"
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_NAME,
  CLOUDINARY_UPLOAD_PATH,
  GOOGLE_CLIENTID,
  GOOGLE_REDIRECT_URL,
  GOOGLE_REFRESH_TOKEN,
  GOOGLE_SECRET_KEY,
  JWT_SECRET_KEY,
  PORT,
  REDIS_URL,
} from "./config-variables";

dotenv.config()


export const config = {
  server: {
    PORT: PORT,
    REDIS_URL: REDIS_URL,
  },
  jwt: {
    JWT_SECRET: JWT_SECRET_KEY,
  },
  cloudinary: {
    CLOUDINARY_UPLOAD_PATH: CLOUDINARY_UPLOAD_PATH,
    CLOUDINARY_NAME: CLOUDINARY_NAME,
    CLOUDINARY_API_KEY: CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: CLOUDINARY_API_SECRET,
  },
  google: {
    GOOGLE_CLIENTID: GOOGLE_CLIENTID,
    GOOGLE_SECRET_KEY: GOOGLE_SECRET_KEY,
    GOOGLE_REDIRECT_URL: GOOGLE_REDIRECT_URL,
    GOOGLE_REFRESH_TOKEN: GOOGLE_REFRESH_TOKEN,
  },
};