import { z } from "zod";

import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";

export const createRoomSchema = z.object({
  name: z.string().min(2, "Room name must be at least 2 characters"),
  code: z.string().min(2, "Room code must be at least 2 characters"),
  capacity: z.number().int().positive("Capacity must be positive"),
  roomType: z.enum(["CLASSROOM", "LAB"]),
  isAvailable: z.boolean().optional()
});

export const updateRoomSchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().min(2).optional(),
  capacity: z.number().int().positive().optional(),
  roomType: z.enum(["CLASSROOM", "LAB"]).optional(),
  isAvailable: z.boolean().optional()
});

type CreateRoomInput = z.infer<typeof createRoomSchema>;
type UpdateRoomInput = z.infer<typeof updateRoomSchema>;

export const roomService = {
  createRoom: async (data: CreateRoomInput) => {
    const existingRoom = await prisma.room.findUnique({
      where: { code: data.code }
    });

    if (existingRoom) {
      throw new ApiError(409, "Room code already exists");
    }

    return prisma.room.create({
      data,
      select: {
        id: true,
        name: true,
        code: true,
        capacity: true,
        roomType: true,
        isAvailable: true,
        createdAt: true,
        updatedAt: true
      }
    });
  },

  getRooms: async () => {
    return prisma.room.findMany({
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        name: true,
        code: true,
        capacity: true,
        roomType: true,
        isAvailable: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            timetables: true,
            conflictReports: true
          }
        }
      }
    });
  },

  getRoomById: async (id: string) => {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        timetables: {
          include: {
            subject: true,
            faculty: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            },
            timeSlot: true
          }
        },
        conflictReports: true
      }
    });

    if (!room) {
      throw new ApiError(404, "Room not found");
    }

    return room;
  },

  updateRoom: async (id: string, data: UpdateRoomInput) => {
    await roomService.getRoomById(id);

    if (data.code) {
      const duplicateRoom = await prisma.room.findFirst({
        where: {
          id: {
            not: id
          },
          code: data.code
        }
      });

      if (duplicateRoom) {
        throw new ApiError(409, "Room code already exists");
      }
    }

    return prisma.room.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        code: true,
        capacity: true,
        roomType: true,
        isAvailable: true,
        createdAt: true,
        updatedAt: true
      }
    });
  },

  deleteRoom: async (id: string) => {
    await roomService.getRoomById(id);

    const linkedRecords = await prisma.room.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            timetables: true,
            conflictReports: true
          }
        }
      }
    });

    if (
      linkedRecords &&
      (linkedRecords._count.timetables > 0 ||
        linkedRecords._count.conflictReports > 0)
    ) {
      throw new ApiError(
        400,
        "Room cannot be deleted because it is linked with timetables or conflict reports"
      );
    }

    await prisma.room.delete({
      where: { id }
    });

    return null;
  }
};