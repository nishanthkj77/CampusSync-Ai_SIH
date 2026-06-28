import { ErrorRequestHandler } from "express";

export const errorMiddleware: ErrorRequestHandler = (error, req, res, next) => {
  res.status(500).json({
    success: false,
    message: error.message || "Internal server error"
  });
};