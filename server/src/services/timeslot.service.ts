import { z } from "zod";

import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";

export const createTimeSlotSchema = z.object({
  day: z.enum([
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY"
  ]),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  slotType: z.enum(["THEORY", "LAB"]),
  isActive: z.boolean().optional()
});

export const updateTimeSlotSchema = z.object({
  day: z
    .enum([
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY"
    ])
    .optional(),
  startTime: z.string().min(1).optional(),
  endTime: z.string().min(1).optional(),
  slotType: z.enum(["THEORY", "LAB"]).optional(),
  isActive: z.boolean().optional()
});

type CreateTimeSlotInput = z.infer<typeof createTimeSlotSchema>;
type UpdateTimeSlotInput = z.infer<typeof updateTimeSlotSchema>;

export const timeslotService = {
  createTimeSlot: async (data: CreateTimeSlotInput) => {
    if (data.startTime >= data.endTime) {
      throw new ApiError(400, "Start time must be before end time");
    }

    const existingSlot = await prisma.timeSlot.findFirst({
      where: {
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime
      }
    });

    if (existingSlot) {
      throw new ApiError(409, "Time slot already exists for this day and time");
    }

    return prisma.timeSlot.create({
      data,
      select: {
        id: true,
        day: true,
        startTime: true,
        endTime: true,
        slotType: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
  },

  getTimeSlots: async () => {
    return prisma.timeSlot.findMany({
      orderBy: [
        {
          day: "asc"
        },
        {
          startTime: "asc"
        }
      ],
      select: {
        id: true,
        day: true,
        startTime: true,
        endTime: true,
        slotType: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            timetables: true
          }
        }
      }
    });
  },

  getTimeSlotById: async (id: string) => {
    const timeSlot = await prisma.timeSlot.findUnique({
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
            room: true
          }
        }
      }
    });

    if (!timeSlot) {
      throw new ApiError(404, "Time slot not found");
    }

    return timeSlot;
  },

  updateTimeSlot: async (id: string, data: UpdateTimeSlotInput) => {
    const existingTimeSlot = await timeslotService.getTimeSlotById(id);

    const finalDay = data.day ?? existingTimeSlot.day;
    const finalStartTime = data.startTime ?? existingTimeSlot.startTime;
    const finalEndTime = data.endTime ?? existingTimeSlot.endTime;

    if (finalStartTime >= finalEndTime) {
      throw new ApiError(400, "Start time must be before end time");
    }

    const duplicateSlot = await prisma.timeSlot.findFirst({
      where: {
        id: {
          not: id
        },
        day: finalDay,
        startTime: finalStartTime,
        endTime: finalEndTime
      }
    });

    if (duplicateSlot) {
      throw new ApiError(409, "Time slot already exists for this day and time");
    }

    return prisma.timeSlot.update({
      where: { id },
      data,
      select: {
        id: true,
        day: true,
        startTime: true,
        endTime: true,
        slotType: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
  },

  deleteTimeSlot: async (id: string) => {
    await timeslotService.getTimeSlotById(id);

    const linkedRecords = await prisma.timeSlot.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            timetables: true
          }
        }
      }
    });

    if (linkedRecords && linkedRecords._count.timetables > 0) {
      throw new ApiError(
        400,
        "Time slot cannot be deleted because it is linked with timetables"
      );
    }

    await prisma.timeSlot.delete({
      where: { id }
    });

    return null;
  }
};
