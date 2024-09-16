import { RequestHandler } from "express";
import prisma from "../../../database/PgDB";
import { StatusCodes } from "http-status-codes";

export class AdminAuth {
  public admin: RequestHandler = async (req, res, next) => {
    try {
      const admin = await prisma.guidentAdmin.findFirst();
      res.status(StatusCodes.CREATED).json({ message: "Admin fetched successfully", data: admin });
    } catch (error) {
      next(error);
    }
  };
}
