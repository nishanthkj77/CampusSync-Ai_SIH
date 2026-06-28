import { z } from "zod";

import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";

export const resolveConflictSchema = z.object({
  isResolved: z.boolean()
});

type ResolveConflictInput = z.infer<typeof resolveConflictSchema>;

const buildKey = (...values: string[]) => values.join("_");

export const conflictReportService = {
  scanConflicts: async () => {
    await prisma.conflictReport.deleteMany({
      where: {
        isResolved: false
      }
    });

    const createdReports = [];

    const timetables = await prisma.timetable.findMany({
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

    const facultySlotMap = new Map<string, typeof timetables>();
    const roomSlotMap = new Map<string, typeof timetables>();

    for (const timetable of timetables) {
      const facultyKey = buildKey(timetable.facultyId, timetable.timeSlotId);
      const roomKey = buildKey(timetable.roomId, timetable.timeSlotId);

      facultySlotMap.set(facultyKey, [
        ...(facultySlotMap.get(facultyKey) ?? []),
        timetable
      ]);

      roomSlotMap.set(roomKey, [
        ...(roomSlotMap.get(roomKey) ?? []),
        timetable
      ]);

      if (
        timetable.subject.labRequired &&
        (timetable.room.roomType !== "LAB" || timetable.timeSlot.slotType !== "LAB")
      ) {
        const report = await prisma.conflictReport.create({
          data: {
            conflictType: "LAB_ALLOCATION_CLASH",
            message: `Lab allocation clash: ${timetable.subject.name} requires LAB room and LAB time slot`,
            timetableId: timetable.id,
            facultyId: timetable.facultyId,
            roomId: timetable.roomId
          }
        });

        createdReports.push(report);
      }
    }

    for (const entries of facultySlotMap.values()) {
      if (entries.length > 1) {
        const first = entries[0];

        const report = await prisma.conflictReport.create({
          data: {
            conflictType: "FACULTY_CLASH",
            message: `Faculty clash: ${first.faculty.user.name} has multiple classes in the same time slot`,
            timetableId: first.id,
            facultyId: first.facultyId,
            roomId: first.roomId
          }
        });

        createdReports.push(report);
      }
    }

    for (const entries of roomSlotMap.values()) {
      if (entries.length > 1) {
        const first = entries[0];

        const report = await prisma.conflictReport.create({
          data: {
            conflictType: "ROOM_CLASH",
            message: `Room clash: ${first.room.name} is assigned to multiple classes in the same time slot`,
            timetableId: first.id,
            facultyId: first.facultyId,
            roomId: first.roomId
          }
        });

        createdReports.push(report);
      }
    }

    const faculties = await prisma.faculty.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        timetables: true
      }
    });

    for (const faculty of faculties) {
      if (faculty.timetables.length > faculty.maxWeeklyHours) {
        const report = await prisma.conflictReport.create({
          data: {
            conflictType: "WORKLOAD_CONFLICT",
            message: `Workload conflict: ${faculty.user.name} has ${faculty.timetables.length} assigned slots, exceeding max weekly hours ${faculty.maxWeeklyHours}`,
            facultyId: faculty.id
          }
        });

        createdReports.push(report);
      }
    }

    const students = await prisma.student.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        courseSelections: {
          include: {
            subject: true
          }
        }
      }
    });

    for (const student of students) {
      const selectedSubjectIds = student.courseSelections.map(
        (selection) => selection.subjectId
      );

      const studentTimetables = await prisma.timetable.findMany({
        where: {
          subjectId: {
            in: selectedSubjectIds
          },
          semester: student.semester,
          batchYear: student.batchYear
        },
        include: {
          subject: true,
          timeSlot: true
        }
      });

      const studentSlotMap = new Map<string, typeof studentTimetables>();

      for (const timetable of studentTimetables) {
        studentSlotMap.set(timetable.timeSlotId, [
          ...(studentSlotMap.get(timetable.timeSlotId) ?? []),
          timetable
        ]);
      }

      for (const entries of studentSlotMap.values()) {
        if (entries.length > 1) {
          const first = entries[0];

          const report = await prisma.conflictReport.create({
            data: {
              conflictType: "STUDENT_SUBJECT_CLASH",
              message: `Student subject clash: ${student.user.name} has multiple selected subjects in the same time slot`,
              timetableId: first.id
            }
          });

          createdReports.push(report);
        }
      }
    }

    return {
      totalConflictsFound: createdReports.length,
      reports: createdReports
    };
  },

  getConflictReports: async () => {
    return prisma.conflictReport.findMany({
      orderBy: {
        createdAt: "desc"
      },
      include: {
        timetable: {
          include: {
            subject: true,
            timeSlot: true
          }
        },
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
    });
  },

  getConflictReportById: async (id: string) => {
    const report = await prisma.conflictReport.findUnique({
      where: {
        id
      },
      include: {
        timetable: {
          include: {
            subject: true,
            timeSlot: true
          }
        },
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
    });

    if (!report) {
      throw new ApiError(404, "Conflict report not found");
    }

    return report;
  },

  resolveConflictReport: async (id: string, data: ResolveConflictInput) => {
    await conflictReportService.getConflictReportById(id);

    return prisma.conflictReport.update({
      where: {
        id
      },
      data: {
        isResolved: data.isResolved
      }
    });
  },

  deleteConflictReport: async (id: string) => {
    await conflictReportService.getConflictReportById(id);

    await prisma.conflictReport.delete({
      where: {
        id
      }
    });

    return null;
  }
};