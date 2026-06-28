import { Request, Response } from "express";

import { departmentService } from "../services/department.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";

const getDepartmentId = (req: Request): string => {
  const id = req.params.id as string;

  if (!id) {
    throw new ApiError(400, "Department ID is required");
  }

  return id;
};

export const departmentController = {
  createDepartment: asyncHandler(async (req: Request, res: Response) => {
    const department = await departmentService.createDepartment(req.body);

    res.status(201).json(
      new ApiResponse("Department created successfully", department)
    );
  }),

  getDepartments: asyncHandler(async (req: Request, res: Response) => {
    const departments = await departmentService.getDepartments();

    res.status(200).json(
      new ApiResponse("Departments fetched successfully", departments)
    );
  }),

  getDepartmentById: asyncHandler(async (req: Request, res: Response) => {
    const id = getDepartmentId(req);

    const department = await departmentService.getDepartmentById(id);

    res.status(200).json(
      new ApiResponse("Department fetched successfully", department)
    );
  }),

  updateDepartment: asyncHandler(async (req: Request, res: Response) => {
    const id = getDepartmentId(req);

    const department = await departmentService.updateDepartment(id, req.body);

    res.status(200).json(
      new ApiResponse("Department updated successfully", department)
    );
  }),

  deleteDepartment: asyncHandler(async (req: Request, res: Response) => {
    const id = getDepartmentId(req);

    await departmentService.deleteDepartment(id);

    res.status(200).json(
      new ApiResponse("Department deleted successfully", null)
    );
  })
};