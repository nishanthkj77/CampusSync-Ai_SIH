import { Request, Response } from "express";

import { timeslotService } from "../services/timeslot.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";

const getTimeSlotId = (req: Request): string => {
  const id = req.params.id as string;

  if (!id) {
    throw new ApiError(400, "Time slot ID is required");
  }

  return id;
};

export const timeslotController = {
  createTimeSlot: asyncHandler(async (req: Request, res: Response) => {
    const timeSlot = await timeslotService.createTimeSlot(req.body);

    res.status(201).json(
      new ApiResponse("Time slot created successfully", timeSlot)
    );
  }),

  getTimeSlots: asyncHandler(async (req: Request, res: Response) => {
    const timeSlots = await timeslotService.getTimeSlots();

    res.status(200).json(
      new ApiResponse("Time slots fetched successfully", timeSlots)
    );
  }),

  getTimeSlotById: asyncHandler(async (req: Request, res: Response) => {
    const id = getTimeSlotId(req);

    const timeSlot = await timeslotService.getTimeSlotById(id);

    res.status(200).json(
      new ApiResponse("Time slot fetched successfully", timeSlot)
    );
  }),

  updateTimeSlot: asyncHandler(async (req: Request, res: Response) => {
    const id = getTimeSlotId(req);

    const timeSlot = await timeslotService.updateTimeSlot(id, req.body);

    res.status(200).json(
      new ApiResponse("Time slot updated successfully", timeSlot)
    );
  }),

  deleteTimeSlot: asyncHandler(async (req: Request, res: Response) => {
    const id = getTimeSlotId(req);

    await timeslotService.deleteTimeSlot(id);

    res.status(200).json(
      new ApiResponse("Time slot deleted successfully", null)
    );
  })
};

