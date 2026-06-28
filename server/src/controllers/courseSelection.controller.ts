import { Request, Response } from "express";

import { courseSelectionService } from "../services/courseSelection.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";

const getParamId = (req: Request, paramName: string): string => {
  const id = req.params[paramName] as string;

  if (!id) {
    throw new ApiError(400, `${paramName} is required`);
  }

  return id;
};

export const courseSelectionController = {
  createCourseSelection: asyncHandler(async (req: Request, res: Response) => {
    const selection = await courseSelectionService.createCourseSelection(req.body);

    res.status(201).json(
      new ApiResponse("Course selection created successfully", selection)
    );
  }),

  getCourseSelections: asyncHandler(async (req: Request, res: Response) => {
    const selections = await courseSelectionService.getCourseSelections();

    res.status(200).json(
      new ApiResponse("Course selections fetched successfully", selections)
    );
  }),

  getCourseSelectionById: asyncHandler(async (req: Request, res: Response) => {
    const id = getParamId(req, "id");

    const selection = await courseSelectionService.getCourseSelectionById(id);

    res.status(200).json(
      new ApiResponse("Course selection fetched successfully", selection)
    );
  }),

  getSelectionsByStudentId: asyncHandler(async (req: Request, res: Response) => {
    const studentId = getParamId(req, "studentId");

    const selections =
      await courseSelectionService.getSelectionsByStudentId(studentId);

    res.status(200).json(
      new ApiResponse("Student course selections fetched successfully", selections)
    );
  }),

  deleteCourseSelection: asyncHandler(async (req: Request, res: Response) => {
    const id = getParamId(req, "id");

    await courseSelectionService.deleteCourseSelection(id);

    res.status(200).json(
      new ApiResponse("Course selection deleted successfully", null)
    );
  })
};
