import { Request, Response } from "express";

import { conflictReportService } from "../services/conflictReport.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";

const getConflictReportId = (req: Request): string => {
  const id = req.params.id as string;

  if (!id) {
    throw new ApiError(400, "Conflict report ID is required");
  }

  return id;
};

export const conflictReportController = {
  scanConflicts: asyncHandler(async (req: Request, res: Response) => {
    const result = await conflictReportService.scanConflicts();

    res.status(201).json(
      new ApiResponse("Conflict scan completed successfully", result)
    );
  }),

  getConflictReports: asyncHandler(async (req: Request, res: Response) => {
    const reports = await conflictReportService.getConflictReports();

    res.status(200).json(
      new ApiResponse("Conflict reports fetched successfully", reports)
    );
  }),

  getConflictReportById: asyncHandler(async (req: Request, res: Response) => {
    const id = getConflictReportId(req);

    const report = await conflictReportService.getConflictReportById(id);

    res.status(200).json(
      new ApiResponse("Conflict report fetched successfully", report)
    );
  }),

  resolveConflictReport: asyncHandler(async (req: Request, res: Response) => {
    const id = getConflictReportId(req);

    const report = await conflictReportService.resolveConflictReport(
      id,
      req.body
    );

    res.status(200).json(
      new ApiResponse("Conflict report updated successfully", report)
    );
  }),

  deleteConflictReport: asyncHandler(async (req: Request, res: Response) => {
    const id = getConflictReportId(req);

    await conflictReportService.deleteConflictReport(id);

    res.status(200).json(
      new ApiResponse("Conflict report deleted successfully", null)
    );
  })
};
