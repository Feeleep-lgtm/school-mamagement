import otpGenerator from "otp-generator";
import gravatar from "gravatar";
import bcrypt from "bcrypt";
import fs from "fs-extra";
import path from "path";
import { Prisma, PrismaClient } from "@prisma/client";

const jsonFolderPath = path.join(__dirname, "../../parents");

export const generateAvatar = (parentEmail: string) => {
  const options: gravatar.Options = {
    s: "200",
    r: "pg",
    d: "mm",
  };
  const avatar = gravatar.url(parentEmail, options, true);
  return avatar;
};

export const generateUsername = (studentName: string) => {
  const random = otpGenerator.generate(3, {
    upperCaseAlphabets: false,
    specialChars: false,
    digits: true,
  });
  return studentName.split(" ")[0]?.toLowerCase() + random;
};

export const hashPassword = async (password: string) => {
  const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
  return hashedPassword;
};

export const readTheJSONParentData = async () => {
  try {
    const jsonFiles = await fs.readdir(jsonFolderPath);
    let mergedData: any[] = [];
    for (const file of jsonFiles) {
      if (file.endsWith(".json")) {
        const filePath = path.join(jsonFolderPath, file);
        const fileData = await fs.readFile(filePath, "utf-8");
        const jsonData = JSON.parse(fileData);
        mergedData = mergedData.concat(jsonData);
      }
    }
    return mergedData;
  } catch (err) {
    console.error("Error reading JSON data:", err);
    return [];
  }
};



export const prisma = new PrismaClient();