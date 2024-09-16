import { RequestHandler } from "express";
import { CloudinaryFunctions } from "../../../helpers/cloudinary";
import { throwError } from "../../../helpers/ControllerError";
import { StatusCodes } from "http-status-codes";
import prisma from "../../../database/PgDB";

export class UploadTeacherService extends CloudinaryFunctions {
  public uploadProfilePicture: RequestHandler = async (req, res, next) => {
    try {
      const { teacherId } = req.params;
      if (!req.file?.path) {
        throwError("Image path is required", StatusCodes.BAD_REQUEST);
      }
      const upload = await this.uploadImage(req.file?.path as string);
      await prisma.user.update({
        where: {
          id: teacherId,
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
        throwError("imageUrl is required", StatusCodes.BAD_REQUEST);
      }
      await this.deleteImage(req.query.imageUrl as string);
      const { teacherId } = req.params;
      await prisma.user.update({
        where: {
          id: teacherId,
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
