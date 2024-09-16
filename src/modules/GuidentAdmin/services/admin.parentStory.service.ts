import { RequestHandler } from "express";
import prisma from "../../../database/PgDB";
import { StatusCodes } from "http-status-codes";
import { NotFoundError } from "../../../errors";

export class AdminParentStory {
  public createStory: RequestHandler = async (req, res, next) => {
    const { title, context, content, minuteRead } = req.body;
    try {
      const admin = await prisma.guidentAdmin.findUnique({
        where: {
          id: req.params.guidentAdminId,
        },
      });
      if (!admin) {
        throw new NotFoundError("Admin not found");
      }
      const createdStory = await prisma.parentStory.create({
        data: {
          title,
          context,
          content,
          minuteRead,
          guidentAdminId: req.params.guidentAdminId,
        },
      });
      res.status(StatusCodes.CREATED).json({ message: "Created successfully", data: createdStory });
    } catch (error) {
      next(error);
    }
  };
  public stories: RequestHandler = async (req, res, next) => {
    try {
      const admin = await prisma.guidentAdmin.findFirst();
      if (!admin) {
        throw new NotFoundError("Admin not found");
      }
      const stories = await prisma.parentStory.findMany();
      res
        .status(StatusCodes.CREATED)
        .json({ message: "Stories fetched successfully", data: stories });
    } catch (error) {
      next(error);
    }
  };
  public story: RequestHandler = async (req, res, next) => {
    try {
      const admin = await prisma.guidentAdmin.findFirst();
      if (!admin) {
        throw new NotFoundError("Admin not found");
      }
      const story = await prisma.parentStory.findUnique({
        where: {
          id: req.params.storyId,
        },
      });
      if (!story) {
        throw new NotFoundError("Story not found");
      }
      res.status(StatusCodes.CREATED).json({ message: "Story fetched successfully", data: story });
    } catch (error) {
      next(error);
    }
  };
  public deleteStory: RequestHandler = async (req, res, next) => {
    try {
      const admin = await prisma.guidentAdmin.findUnique({
        where: {
          id: req.params.guidentAdminId,
        },
      });
      if (!admin) {
        throw new NotFoundError("Admin not found");
      }
      const story = await prisma.parentStory.findUnique({
        where: {
          id: req.params.storyId,
        },
      });
      if (!story) {
        throw new NotFoundError("Story not found");
      }
      await prisma.parentStory.delete({
        where: {
          id: story?.id,
        },
      });
      res.status(StatusCodes.CREATED).json({ message: "Story deleted successfully" });
    } catch (error) {
      next(error);
    }
  };
  public updateStory: RequestHandler = async (req, res, next) => {
    const { title, context, content, minuteRead } = req.body;
    try {
      const admin = await prisma.guidentAdmin.findUnique({
        where: {
          id: req.params.guidentAdminId,
        },
      });
      if (!admin) {
        throw new NotFoundError("Admin not found");
      }
      const story = await prisma.parentStory.findUnique({
        where: {
          id: req.params.storyId,
        },
      });
      if (!story) {
        throw new NotFoundError("Story not found");
      }
      const updateStory = await prisma.parentStory.update({
        where: {
          id: story?.id,
        },
        data: {
          title,
          context,
          content,
          minuteRead,
        },
      });
      res
        .status(StatusCodes.CREATED)
        .json({ message: "Story updated successfully", data: updateStory });
    } catch (error) {
      next(error);
    }
  };
}
