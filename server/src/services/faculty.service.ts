import { z } from "zod";

import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";

export const createFacultySchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  departmentId: z.string().min(1, "Department ID is required"),
  employeeCode: z.string().min(2, "Employee code is required"),
  designation: z.string().optional(),
  maxWeeklyHours: z.number().int().positive().default(18),
  isAvailable: z.boolean().optional()
});

export const updateFacultySchema = z.object({
  departmentId: z.string().min(1).optional(),
  employeeCode: z.string().min(2).optional(),
  designation: z.string().optional(),
  maxWeeklyHours: z.number().int().positive().optional(),
  isAvailable: z.boolean().optional()
});

type CreateFacultyInput = z.infer<typeof createFacultySchema>;
type UpdateFacultyInput = z.infer<typeof updateFacultySchema>;

export const facultyService = {
  createFaculty: async (data: CreateFacultyInput) => {
    const user = await prisma.user.findUnique({
      where: { id: data.userId }
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.role !== "FACULTY" && user.role !== "HOD") {
      throw new ApiError(400, "Only FACULTY or HOD users can be mapped as faculty");
    }

    const department = await prisma.department.findUnique({
      where: { id: data.departmentId }
    });

    if (!department) {
      throw new ApiError(404, "Department not found");
    }

    const existingFacultyForUser = await prisma.faculty.findUnique({
      where: { userId: data.userId }
    });

    if (existingFacultyForUser) {
      throw new ApiError(409, "This user is already mapped as faculty");
    }

    const existingEmployeeCode = await prisma.faculty.findUnique({
      where: { employeeCode: data.employeeCode }
    });

    if (existingEmployeeCode) {
      throw new ApiError(409, "Employee code already exists");
    }

    return prisma.faculty.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true
          }
        },
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });
  },

  getFaculties: async () => {
    return prisma.faculty.findMany({
      orderBy: {
        createdAt: "desc"
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true
          }
        },
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        _count: {
          select: {
            subjects: true,
            timetables: true
          }
        }
      }
    });
  },

  getFacultyById: async (id: string) => {
    const faculty = await prisma.faculty.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true
          }
        },
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        _count: {
          select: {
            subjects: true,
            timetables: true
          }
        }
      }
    });

    if (!faculty) {
      throw new ApiError(404, "Faculty not found");
    }

    return {
      ...faculty,
      workload: {
        maxWeeklyHours: faculty.maxWeeklyHours,
        assignedSlots: faculty._count.timetables
      }
    };
  },

  updateFaculty: async (id: string, data: UpdateFacultyInput) => {
    await facultyService.getFacultyById(id);

    if (data.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: data.departmentId }
      });

      if (!department) {
        throw new ApiError(404, "Department not found");
      }
    }

    if (data.employeeCode) {
      const duplicateFaculty = await prisma.faculty.findFirst({
        where: {
          id: {
            not: id
          },
          employeeCode: data.employeeCode
        }
      });

      if (duplicateFaculty) {
        throw new ApiError(409, "Employee code already exists");
      }
    }

    return prisma.faculty.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true
          }
        },
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });
  },

  deleteFaculty: async (id: string) => {
    await facultyService.getFacultyById(id);

    const linkedRecords = await prisma.faculty.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            subjects: true,
            timetables: true,
            conflictReports: true
          }
        }
      }
    });

    if (
      linkedRecords &&
      (linkedRecords._count.subjects > 0 ||
        linkedRecords._count.timetables > 0 ||
        linkedRecords._count.conflictReports > 0)
    ) {
      throw new ApiError(
        400,
        "Faculty cannot be deleted because it is linked with subjects, timetables, or conflict reports"
      );
    }

    await prisma.faculty.delete({
      where: { id }
    });

    return null;
  }
};