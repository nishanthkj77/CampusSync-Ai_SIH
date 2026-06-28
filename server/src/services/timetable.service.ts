 import { z } from "zod";

import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";

export const generateTimetableSchema = z.object({
  academicYear: z.string().min(4, "Academic year is required"),
  semester: z.number().int().min(1).max(12),
  batchYear: z.number().int().min(2000),
  departmentId: z.string().min(1, "Department ID is required"),
  subjectId: z.string().min(1, "Subject ID is required"),
  facultyId: z.string().min(1, "Faculty ID is required"),
  roomId: z.string().min(1, "Room ID is required"),
  timeSlotId: z.string().min(1, "Time slot ID is required")
});

type GenerateTimetableInput = z.infer<typeof generateTimetableSchema>;

export const timetableService = {
  generateTimetableEntry: async (data: GenerateTimetableInput) => {
    const department = await prisma.department.findUnique({
      where: {
        id: data.departmentId
      }
    });

    if (!department || !department.isActive) {
      throw new ApiError(404, "Active department not found");
    }

    const subject = await prisma.subject.findUnique({
      where: {
        id: data.subjectId
      }
    });

    if (!subject || !subject.isActive) {
      throw new ApiError(404, "Active subject not found");
    }

    const faculty = await prisma.faculty.findUnique({
      where: {
        id: data.facultyId
      }
    });

    if (!faculty || !faculty.isAvailable) {
      throw new ApiError(404, "Available faculty not found");
    }

    const room = await prisma.room.findUnique({
      where: {
        id: data.roomId
      }
    });

    if (!room || !room.isAvailable) {
      throw new ApiError(404, "Available room not found");
    }

    const timeSlot = await prisma.timeSlot.findUnique({
      where: {
        id: data.timeSlotId
      }
    });

    if (!timeSlot || !timeSlot.isActive) {
      throw new ApiError(404, "Active time slot not found");
    }

    if (subject.departmentId !== data.departmentId) {
      throw new ApiError(400, "Subject does not belong to selected department");
    }

    if (faculty.departmentId !== data.departmentId) {
      throw new ApiError(400, "Faculty does not belong to selected department");
    }

    if (subject.labRequired && room.roomType !== "LAB") {
      throw new ApiError(400, "Lab subject must be assigned to a LAB room");
    }

    if (subject.labRequired && timeSlot.slotType !== "LAB") {
      throw new ApiError(400, "Lab subject must be assigned to a LAB time slot");
    }

    if (!subject.labRequired && timeSlot.slotType === "LAB") {
      throw new ApiError(400, "Theory subject cannot be assigned to a LAB slot");
    }

    const facultyClash = await prisma.timetable.findFirst({
      where: {
        facultyId: data.facultyId,
        timeSlotId: data.timeSlotId
      }
    });

    if (facultyClash) {
      throw new ApiError(409, "Faculty clash detected for this time slot");
    }

    const roomClash = await prisma.timetable.findFirst({
      where: {
        roomId: data.roomId,
        timeSlotId: data.timeSlotId
      }
    });

    if (roomClash) {
      throw new ApiError(409, "Room clash detected for this time slot");
    }

    const facultyWorkload = await prisma.timetable.count({
      where: {
        facultyId: data.facultyId,
        academicYear: data.academicYear
      }
    });

    if (facultyWorkload >= faculty.maxWeeklyHours) {
      throw new ApiError(400, "Faculty workload limit exceeded");
    }

    return prisma.timetable.create({
      data: {
        academicYear: data.academicYear,
        semester: data.semester,
        batchYear: data.batchYear,
        departmentId: data.departmentId,
        subjectId: data.subjectId,
        facultyId: data.facultyId,
        roomId: data.roomId,
        timeSlotId: data.timeSlotId
      },
      include: {
        subject: true,
        faculty: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                role: true
              }
            }
          }
        },
        room: true,
        timeSlot: true
      }
    });
  },

  getTimetables: async () => {
    return prisma.timetable.findMany({
      orderBy: {
        createdAt: "desc"
      },
      include: {
        subject: true,
        faculty: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                role: true
              }
            }
          }
        },
        room: true,
        timeSlot: true
      }
    });
  },

  getTimetableById: async (id: string) => {
    const timetable = await prisma.timetable.findUnique({
      where: {
        id
      },
      include: {
        subject: true,
        faculty: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                role: true
              }
            }
          }
        },
        room: true,
        timeSlot: true,
        conflictReports: true
      }
    });

    if (!timetable) {
      throw new ApiError(404, "Timetable not found");
    }

    return timetable;
  },

  getStudentTimetable: async (studentId: string) => {
    const student = await prisma.student.findUnique({
      where: {
        id: studentId
      },
      include: {
        courseSelections: {
          select: {
            subjectId: true
          }
        }
      }
    });

    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    const subjectIds = student.courseSelections.map(
      (selection) => selection.subjectId
    );

    return prisma.timetable.findMany({
      where: {
        subjectId: {
          in: subjectIds
        },
        semester: student.semester,
        batchYear: student.batchYear
      },
      orderBy: {
        createdAt: "desc"
      },
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
        room: true,
        timeSlot: true
      }
    });
  },

  getFacultyTimetable: async (facultyId: string) => {
    const faculty = await prisma.faculty.findUnique({
      where: {
        id: facultyId
      }
    });

    if (!faculty) {
      throw new ApiError(404, "Faculty not found");
    }

    return prisma.timetable.findMany({
      where: {
        facultyId
      },
      orderBy: {
        createdAt: "desc"
      },
      include: {
        subject: true,
        room: true,
        timeSlot: true
      }
    });
  },

  getRoomTimetable: async (roomId: string) => {
    const room = await prisma.room.findUnique({
      where: {
        id: roomId
      }
    });

    if (!room) {
      throw new ApiError(404, "Room not found");
    }

    return prisma.timetable.findMany({
      where: {
        roomId
      },
      orderBy: {
        createdAt: "desc"
      },
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
    });
  }
};