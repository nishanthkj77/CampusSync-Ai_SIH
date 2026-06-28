import { Request, Response } from "express";

import { subjectService } from "../services/subject.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";

const getSubjectId = (req: Request): string => {
  const id = req.params.id as string;

  if (!id) {
    throw new ApiError(400, "Subject ID is required");
  }

  return id;
};

export const subjectController = {
  createSubject: asyncHandler(async (req: Request, res: Response) => {
    const subject = await subjectService.createSubject(req.body);

    res.status(201).json(
      new ApiResponse("Subject created successfully", subject)
    );
  }),

  getSubjects: asyncHandler(async (req: Request, res: Response) => {
    const subjects = await subjectService.getSubjects();

    res.status(200).json(
      new ApiResponse("Subjects fetched successfully", subjects)
    );
  }),

  getSubjectById: asyncHandler(async (req: Request, res: Response) => {
    const id = getSubjectId(req);

    const subject = await subjectService.getSubjectById(id);

    res.status(200).json(
      new ApiResponse("Subject fetched successfully", subject)
    );
  }),

  updateSubject: asyncHandler(async (req: Request, res: Response) => {
    const id = getSubjectId(req);

    const subject = await subjectService.updateSubject(id, req.body);

    res.status(200).json(
      new ApiResponse("Subject updated successfully", subject)
    );
  }),

  deleteSubject: asyncHandler(async (req: Request, res: Response) => {
    const id = getSubjectId(req);

    await subjectService.deleteSubject(id);

    res.status(200).json(
      new ApiResponse("Subject deleted successfully", null)
    );
  })
};
