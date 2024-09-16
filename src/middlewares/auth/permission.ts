import { Request, Response, NextFunction, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { MyControllerAndErrorFunction } from "../../helpers/ControllerError";


const throwError = new MyControllerAndErrorFunction().throwError


type Permission = "create" | "read" | "update" | "delete";

const checkPermissions = (requiredPermission: Permission): RequestHandler => {
  const permissions = ["read", "update", "delete"];
  return (req: Request, res: Response, next: NextFunction) => {
    const hasPermissions = permissions.includes(requiredPermission);
    if (!hasPermissions) {
      throwError(
        "You do not have permission to perform this action",
        StatusCodes.FORBIDDEN
      );
    }
    next();
  };
};

export default checkPermissions;