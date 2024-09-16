const { format, transports } = require("winston");
import { RequestHandler, Request, Response } from "express";
import path from "path";
import expressWinston from "express-winston";
import winston from "winston";
import { readFile } from "fs";

export class Winston {
  public static ErrorLogger() {
    return expressWinston.errorLogger({
      transports: [
        new transports.File({
          filename: "server.log",
          __dirname: "/server.log",
          msg(req: Request, res: Response) {
            return `${res.statusCode} - ${req.method}`;
          },
          format: format.combine(
            format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
            format.align(),
            format.printf(
              (info: {
                level: string;
                info: string;
                timestamp: Date;
                message: string;
                meta: {
                  stack: string;
                };
              }) => `${info.level}: ${[info.timestamp]}: ${info.meta.stack}`
            )
          ),
          options: { flags: "w", mode: 0o755, flag: "wx" },
        }),
      ],
      format: winston.format.combine(winston.format.colorize(), winston.format.json()),
    });
  }
  public static setupServerErrorRoute: RequestHandler = async (req, res, next) => {
    const logFilePath = path.join(__dirname, "../../../server.log");
    readFile(logFilePath, "utf8", (err, logData) => {
      if (err) {
        next(err);
      } else {
        const errors = logData
          .split("\n")
          .filter((line) => line.length)
          .map((log) => {
            const [timestamp, error, ...details] = log.split(" ");
            return { timestamp, error, details: details.join(" ") };
          });
        res.render("error-log", { errors, layout: false });
      }
    });
  };
}
