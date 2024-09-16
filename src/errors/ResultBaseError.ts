import { StatusCodes } from "http-status-codes";

export class ResultBaseError extends Error {
  public message: string = "";
  public statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR;
  public updateStudentResultError: { studentName: string; [name: string]: string }[] = [];

  constructor(
    message: string,
    updateStudentResultError: { studentName: string; [name: string]: string }[],
    statusCode?: number
  ) {
    super();
    if (message) this.message = message;
    if (statusCode) this.statusCode = statusCode;
    if (updateStudentResultError.length) this.updateStudentResultError = updateStudentResultError;
  }
}
