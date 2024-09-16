import { StatusCodes } from "http-status-codes";
import { ResultBaseError } from "./ResultBaseError";


export class updateStudentResultError extends ResultBaseError {
  constructor(
    message = "Forbidden Error",
    updateStudentResultError: { studentName: string; [name: string]: string }[] = []
  ) {
    super(message, updateStudentResultError, StatusCodes.BAD_REQUEST);
  }
}
