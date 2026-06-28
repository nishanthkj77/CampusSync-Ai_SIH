import { Request, Response } from "express";

import { facultyService } from "../services/faculty.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";

const getFacultyId = (req: Request): string => {
  const id = req.params.id as string;

  if (!id) {
    throw new ApiError(400, "Faculty ID is required");
  }

  return id;
};

export const facultyController = {
  createFaculty: asyncHandler(async (req: Request, res: Response) => {
    const faculty = await facultyService.createFaculty(req.body);

    res.status(201).json(
      new ApiResponse("Faculty created successfully", faculty)
    );
  }),

  getFaculties: asyncHandler(async (req: Request, res: Response) => {
    const faculties = await facultyService.getFaculties();

    res.status(200).json(
      new ApiResponse("Faculties fetched successfully", faculties)
    );
  }),

  getFacultyById: asyncHandler(async (req: Request, res: Response) => {
    const id = getFacultyId(req);

    const faculty = await facultyService.getFacultyById(id);

    res.status(200).json(
      new ApiResponse("Faculty fetched successfully", faculty)
    );
  }),

  updateFaculty: asyncHandler(async (req: Request, res: Response) => {
    const id = getFacultyId(req);

    const faculty = await facultyService.updateFaculty(id, req.body);

    res.status(200).json(
      new ApiResponse("Faculty updated successfully", faculty)
    );
  }),

  deleteFaculty: asyncHandler(async (req: Request, res: Response) => {
    const id = getFacultyId(req);

    await facultyService.deleteFaculty(id);

    res.status(200).json(
      new ApiResponse("Faculty deleted successfully", null)
    );
  })
};