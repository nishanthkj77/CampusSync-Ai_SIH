import { NextFunction, Request, Response } from "express";
import { UserRole } from "../constants/roles";

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({
        success: false,
        message: "Access denied"
      });
      return;
    }

    next();
  };
};