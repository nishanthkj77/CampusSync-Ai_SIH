 import { Request, Response } from "express";

import { timetableService } from "../services/timetable.service";
import { aiTimetableService } from "../services/aiTimetable.service";
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

export const timetableController = {
  generateTimetableEntry: asyncHandler(async (req: Request, res: Response) => {
    const timetable = await timetableService.generateTimetableEntry(req.body);

    res.status(201).json(
      new ApiResponse("Timetable generated successfully", timetable)
    );
  }),

  generateTimetableWithAi: asyncHandler(async (req: Request, res: Response) => {
    const result = await aiTimetableService.generateWithAiEngine(req.body);

    res.status(201).json(
      new ApiResponse("AI timetable generated successfully", result)
    );
  }),

  getTimetables: asyncHandler(async (req: Request, res: Response) => {
    const timetables = await timetableService.getTimetables();

    res.status(200).json(
      new ApiResponse("Timetables fetched successfully", timetables)
    );
  }),

  getTimetableById: asyncHandler(async (req: Request, res: Response) => {
    const id = getParamId(req, "id");

    const timetable = await timetableService.getTimetableById(id);

    res.status(200).json(
      new ApiResponse("Timetable fetched successfully", timetable)
    );
  }),

  getStudentTimetable: asyncHandler(async (req: Request, res: Response) => {
    const studentId = getParamId(req, "studentId");

    const timetable = await timetableService.getStudentTimetable(studentId);

    res.status(200).json(
      new ApiResponse("Student timetable fetched successfully", timetable)
    );
  }),

  getFacultyTimetable: asyncHandler(async (req: Request, res: Response) => {
    const facultyId = getParamId(req, "facultyId");

    const timetable = await timetableService.getFacultyTimetable(facultyId);

    res.status(200).json(
      new ApiResponse("Faculty timetable fetched successfully", timetable)
    );
  }),

  getRoomTimetable: asyncHandler(async (req: Request, res: Response) => {
    const roomId = getParamId(req, "roomId");

    const timetable = await timetableService.getRoomTimetable(roomId);

    res.status(200).json(
      new ApiResponse("Room timetable fetched successfully", timetable)
    );
  })
};