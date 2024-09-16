import dotenv from "dotenv";
dotenv.config();

import { Error } from "../interfaces/error-interfaces";

export class MyControllerAndErrorFunction {
  /**
   *  This is a custom error function that transport defined message to the express error handler. Should be used throughout the app.
   * @param AuthRequest
   *
   * @param res
   * @param next
   */
  throwError = (
    errorMsg: string,
    statusCode: number,
  ) => {
    const error: Error = new Error(errorMsg);
    error.statusCode = statusCode;
    throw new Error(error.message);
  };
}

export const { throwError } = new MyControllerAndErrorFunction();
