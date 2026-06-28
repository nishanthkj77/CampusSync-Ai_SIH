import { Request, Response } from "express";

import { studentService } from "../services/student.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";

const getStudentId = (req: Request): string => {
  const id = req.params.id as string;

  if (!id) {
    throw new ApiError(400, "Student ID is required");
  }

  return id;
};

export const studentController = {
  createStudent: asyncHandler(async (req: Request, res: Response) => {
    const student = await studentService.createStudent(req.body);

    res.status(201).json(
      new ApiResponse("Student created successfully", student)
    );
  }),

  getStudents: asyncHandler(async (req: Request, res: Response) => {
    const students = await studentService.getStudents();

    res.status(200).json(
      new ApiResponse("Students fetched successfully", students)
    );
  }),

  getStudentById: asyncHandler(async (req: Request, res: Response) => {
    const id = getStudentId(req);

    const student = await studentService.getStudentById(id);

    res.status(200).json(
      new ApiResponse("Student fetched successfully", student)
    );
  }),

  updateStudent: asyncHandler(async (req: Request, res: Response) => {
    const id = getStudentId(req);

    const student = await studentService.updateStudent(id, req.body);

    res.status(200).json(
      new ApiResponse("Student updated successfully", student)
    );
  }),

  deleteStudent: asyncHandler(async (req: Request, res: Response) => {
    const id = getStudentId(req);

    await studentService.deleteStudent(id);

    res.status(200).json(
      new ApiResponse("Student deleted successfully", null)
    );
  })
};