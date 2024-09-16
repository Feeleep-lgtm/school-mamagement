import cloudinary from "cloudinary"
import { config } from "../configurations/config"
import multer from "multer";
import { throwError } from "./ControllerError";
import { StatusCodes } from "http-status-codes";


export abstract class CloudinaryFunctions {
    public async uploadImage(path: string) {
        const upload = await cloudinary.v2.uploader.upload(path, { folder: config.cloudinary.CLOUDINARY_UPLOAD_PATH })
        if (!upload) {
            throwError("Error uploading image", StatusCodes.INTERNAL_SERVER_ERROR)
        }
        return upload
    }
    public async deleteImage(imagePublicId: string) {
        const deleteImageResponse = await cloudinary.v2.uploader.destroy(imagePublicId)
        if (!deleteImageResponse) {
            throwError("Error deleting image", StatusCodes.INTERNAL_SERVER_ERROR)
        }
        return true
    }
    public getMulter() {
        const upload = multer({ dest: "uploads/" });
        return upload
    }
}