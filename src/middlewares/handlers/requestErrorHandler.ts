import { NextFunction, Request, Response } from "express";
import { ValidationError } from "express-validation";
import { RequestError } from "../../interfaces/error-interfaces";
import { ResultBaseError } from "../../errors/ResultBaseError";

const errorHandler = (error: RequestError, req: Request, res: Response, next: NextFunction) => {
  const message = error.message || "encounter error";
  const status = error.statusCode || 500;
  const updateStudentResultError = error.updateStudentResultError || [];

  if (error instanceof ValidationError) {
    return res.status(error.statusCode).json(error);
  } else if (error instanceof ResultBaseError) {
    res.status(status).json({
      message,
      nonExistingResults: updateStudentResultError,
      error: "Error message",
      errorStatus: status,
    });
  } else {
    res.status(status).json({
      message,
      error: "Error message",
      errorStatus: status,
    });
  }
  next();
};

export default errorHandler;
