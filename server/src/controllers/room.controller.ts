import { Request, Response } from "express";

import { roomService } from "../services/room.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";

const getRoomId = (req: Request): string => {
  const id = req.params.id as string;

  if (!id) {
    throw new ApiError(400, "Room ID is required");
  }

  return id;
};

export const roomController = {
  createRoom: asyncHandler(async (req: Request, res: Response) => {
    const room = await roomService.createRoom(req.body);

    res.status(201).json(new ApiResponse("Room created successfully", room));
  }),

  getRooms: asyncHandler(async (req: Request, res: Response) => {
    const rooms = await roomService.getRooms();

    res.status(200).json(new ApiResponse("Rooms fetched successfully", rooms));
  }),

  getRoomById: asyncHandler(async (req: Request, res: Response) => {
    const id = getRoomId(req);

    const room = await roomService.getRoomById(id);

    res.status(200).json(new ApiResponse("Room fetched successfully", room));
  }),

  updateRoom: asyncHandler(async (req: Request, res: Response) => {
    const id = getRoomId(req);

    const room = await roomService.updateRoom(id, req.body);

    res.status(200).json(new ApiResponse("Room updated successfully", room));
  }),

  deleteRoom: asyncHandler(async (req: Request, res: Response) => {
    const id = getRoomId(req);

    await roomService.deleteRoom(id);

    res.status(200).json(new ApiResponse("Room deleted successfully", null));
  })
};
