import { NextFunction, Response } from "express";
import Jwt from "jsonwebtoken";
import { AuthRequest } from "../../interfaces/types";
import { BadRequestError, UnauthorizedError } from "../../errors";
import { config } from "../../configurations/config";
import { UserRepository } from "../../shared/repository/userRepository";

export class AuthMiddleware {
  private userRepository = new UserRepository();

  /**
   * This middleware will set and verify the user making request to the server resources
   * @param AuthRequest
   * @param res
   * @param next
   */

  public Auth = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.get("Authorization");
      if (!authHeader) {
        throw new BadRequestError("Authorization token is required");
      }
      let decode: any;
      const token = authHeader?.split(" ")[1];
      decode = Jwt.verify(token as string, `${config.jwt.JWT_SECRET}`);
      if (!token || !decode) {
        throw new BadRequestError("Invalid token");
      }
      req.authId = decode.authId;
      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * This middleware will set and verify the user making request to the server resources
   * @param AuthRequest
   * @param res
   * @param next
   */
  public teacherAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { teacherId } = req.params;
      const teacher = await this.userRepository.findUserById(teacherId);
      if (teacher.id !== req.authId) {
        throw new UnauthorizedError("You are not authorized");
      }
      if (!teacher.profileCompleted) {
        throw new UnauthorizedError("Please complete profile registration");
      }
      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * This middleware will set and verify the user making request to the server resources
   * @param AuthRequest
   * @param res
   * @param next
   */
  public schoolAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req?.authId) {
        throw new BadRequestError("authId not set");
      }
      const { schoolId } = req.params;
      const school = await this.userRepository.findUserById(schoolId);
      if (school.id !== req.authId) {
        throw new UnauthorizedError("You are not authorized");
      }
      if (!school.profileCompleted) {
        throw new UnauthorizedError("Please complete profile registration");
      }
      if (school.status === "BLOCKED") {
        throw new UnauthorizedError("Your account is blocked or deactivated");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
  public parentAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req?.authId) {
        throw new BadRequestError("authId not set");
      }
      const { parentId } = req.params;
      const parent = await this.userRepository.findUserById(parentId);
      if (parent.id !== req.authId) {
        throw new UnauthorizedError("You are not authorized");
      }
      if (!parent.profileCompleted) {
        throw new UnauthorizedError("Please complete profile registration");
      }
      if (parent.status === "BLOCKED") {
        throw new UnauthorizedError("Your account is blocked or deactivated");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
