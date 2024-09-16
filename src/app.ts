import express, { NextFunction, Request, Response, type Application } from "express";
import "express-async-errors";
import cloudinary from "cloudinary";
import bodyParser from "body-parser";
import cors from "cors";
import compression from "compression";
import responseTime from "response-time";
import useragent from "express-useragent";
import requestHeaders from "./middlewares/handlers/requestHeaders";
import errorHandler from "./middlewares/handlers/requestErrorHandler";
import { pageNotFound } from "./middlewares/errors/404Page";
import v2Api from "./routes/v2Api.route";
import { config } from "./configurations/config";
import path from "path";
import { engine } from "express-handlebars";
import { Winston } from "./middlewares/errors/winstonErrorLogger";
import prisma from "./database/PgDB";
import { NotFoundError } from "./errors";
import { ServerUtils } from "./helpers/utils";
import { StatusCodes } from "http-status-codes";

const utils = new ServerUtils();

const app: Application = express();

cloudinary.v2.config({
  cloud_name: config.cloudinary.CLOUDINARY_NAME,
  api_key: config.cloudinary.CLOUDINARY_API_KEY,
  api_secret: config.cloudinary.CLOUDINARY_API_SECRET,
});

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors({ credentials: true, origin: "*" }));
app.options("*", cors());

app.use(compression());

app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "../views"));
app.engine(
  "handlebars",
  engine({
    defaultLayout: false,
    extname: ".handlebars",
    layoutsDir: path.join(__dirname, "../views"),
    partialsDir: path.join(__dirname, "../views"),
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.use(requestHeaders);

app.use(responseTime());

app.use(useragent.express());

app.get("/logs", Winston.setupServerErrorRoute);

app.use("/api", v2Api);

app.post("/api/v2/users/delete-user", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.body.email },
    });
    if (!user) {
      throw new NotFoundError("User does not exist");
    }
    await utils.validatePassword(req.body.password, user.password as string);
    await prisma.user.update({
      where: {
        id: user.email,
      },
      data: {
        status: "BLOCKED",
      },
    });
    res.status(StatusCodes.OK).json({ message: "Account deleted successfully" });
  } catch (error) {
    next(error);
  }
});

app.use(pageNotFound);

app.use(Winston.ErrorLogger());

app.use(errorHandler);

export { app };
