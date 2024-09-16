import { RequestHandler } from "express";
import { CloudinaryFunctions } from "../../../helpers/cloudinary";
import { StatusCodes } from "http-status-codes";
import prisma from "../../../database/PgDB";
import { BadRequestError, UnauthorizedError } from "../../../errors";
import { UserRepository } from "../../../shared/repository/userRepository";

export class UploadSchoolAssets extends CloudinaryFunctions {
  private userRepository = new UserRepository();
  public uploadProfilePicture: RequestHandler = async (req, res, next) => {
    try {
      const { schoolId } = req.params;
      const school = await this.userRepository.findUserById(schoolId);
      if (!school) {
        throw new UnauthorizedError("You are not authorized");
      }
      if (!req.file?.path) {
        throw new BadRequestError("Image path is required");
      }
      const upload = await this.uploadImage(req.file?.path as string);
      await prisma.user.update({
        where: {
          id: schoolId,
        },
        data: {
          profilePicture: upload.url,
          imageUrl: upload.public_id,
        },
      });
      res.status(StatusCodes.CREATED).json({ message: "Profile picture uploaded successfully" });
    } catch (error) {
      next(error);
    }
  };
  public deleteProfilePicture: RequestHandler = async (req, res, next) => {
    try {
      if (!req.query.imageUrl) {
        throw new BadRequestError("imageUrl is required");
      }
      await this.deleteImage(req.query.imageUrl as string);
      const { schoolId } = req.params;
      await prisma.user.update({
        where: {
          id: schoolId,
        },
        data: {
          profilePicture: "",
          imageUrl: "",
        },
      });
      res.status(StatusCodes.CREATED).json({ message: "Profile picture deleted successfully" });
    } catch (error) {
      next(error);
    }
  };
}
