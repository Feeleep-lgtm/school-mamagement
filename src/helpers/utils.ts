import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import generator from "generate-password";
import cache from "memory-cache";
import otpGenerator from "otp-generator";
import gravatar from "gravatar";
import { StatusCodes } from "http-status-codes";
import { MyControllerAndErrorFunction } from "../helpers/ControllerError";
import { config } from "../configurations/config";
import { BadRequestError } from "../errors";
const throwError = new MyControllerAndErrorFunction().throwError;

interface removeItemType {
  item: string;
}

export class ServerUtils {
  emailRegex: RegExp;
  constructor() {
    this.emailRegex = /\S+@\S+\.\S+/;
  }
  public emailRegexFunction() {
    return this.emailRegex;
  }
  public generatePassword() {
    return generator.generate({
      length: 10,
      numbers: true,
    });
  }
  public salt = async () => await bcrypt.genSalt(10);
  public getMutatedMongooseField = <T extends removeItemType>(field: T) => {
    const { item, ...otherValue } = field;
    return otherValue;
  };
  public diff_minutes(dt2: Date, dt1: Date) {
    let diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60;
    return Math.abs(Math.round(diff));
  }
  public getGrade(total: number, subjectScores: any, subject: string) {
    if (subjectScores[subject].exam === 0) {
      return "";
    }
    if (total >= 70) {
      return "A";
    } else if (total >= 60) {
      return "B";
    } else if (total >= 50) {
      return "C";
    } else if (total >= 45) {
      return "D";
    } else if (total >= 30) {
      return "E";
    } else {
      return "F";
    }
  }
  public generateOTP(): string {
    const OTP = otpGenerator.generate(5, {
      upperCaseAlphabets: false,
      specialChars: false,
      digits: true,
    });
    return OTP;
  }
  public capitalizeFirstLetter(str: string) {
    if (typeof str !== "string") {
      throwError("Input must be a string", StatusCodes.BAD_REQUEST);
    }
    if (str.length === 0) {
      return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  public generateAvatar = (parentEmail: string) => {
    const options: gravatar.Options = {
      s: "200",
      r: "pg",
      d: "mm",
    };
    const avatar = gravatar.url(parentEmail, options, true);
    return avatar;
  };
  public generateUsername = (studentName: string) => {
    const random = otpGenerator.generate(3, {
      upperCaseAlphabets: false,
      specialChars: false,
      digits: true,
    });
    return studentName.split(" ")[0]?.toLowerCase() + random;
  };
  public get_random_number = (): number => {
    const random_numbers = cache.get("random_numbers");
    if (!random_numbers) {
      // Pre-generate a list of random numbers
      const new_random_numbers = [];
      for (let i = 0; i < 5; i++) {
        new_random_numbers.push(Math.floor(1000 + Math.random() * 9000));
      }
      // Store the list in cache for 1 hour
      cache.put("random_numbers", new_random_numbers, 60 * 60 * 1000);
      return new_random_numbers[Math.floor(Math.random() * new_random_numbers.length)];
    }
    return random_numbers[Math.floor(Math.random() * random_numbers.length)];
  };
  public hashPassword = async (password: string) => {
    const hashedPassword = await bcrypt.hash(password, await this.salt());
    return hashedPassword;
  };
  public async validatePassword(password: string, comparePassword: string): Promise<boolean> {
    const isPasswordValid = await bcrypt.compare(password, comparePassword);
    if (!isPasswordValid) {
      throw new BadRequestError("Invalid password");
    }
    return isPasswordValid;
  }
  public createToken(authId: string): string {
    const token = jwt.sign({ authId }, config.jwt.JWT_SECRET, { expiresIn: "30d" });
    return token;
  }
}
