import { z } from "zod";

import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";

export const createStudentSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  departmentId: z.string().min(1, "Department ID is required"),
  registerNumber: z.string().min(2, "Register number is required"),
  semester: z.number().int().min(1).max(12),
  batchYear: z.number().int().min(2000),
  isActive: z.boolean().optional()
});

export const updateStudentSchema = z.object({
  departmentId: z.string().min(1).optional(),
  registerNumber: z.string().min(2).optional(),
  semester: z.number().int().min(1).max(12).optional(),
  batchYear: z.number().int().min(2000).optional(),
  isActive: z.boolean().optional()
});

type CreateStudentInput = z.infer<typeof createStudentSchema>;
type UpdateStudentInput = z.infer<typeof updateStudentSchema>;

export const studentService = {
  createStudent: async (data: CreateStudentInput) => {
    const user = await prisma.user.findUnique({
      where: { id: data.userId }
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.role !== "STUDENT") {
      throw new ApiError(400, "Only STUDENT users can be mapped as student");
    }

    const department = await prisma.department.findUnique({
      where: { id: data.departmentId }
    });

    if (!department) {
      throw new ApiError(404, "Department not found");
    }

    const existingStudentForUser = await prisma.student.findUnique({
      where: { userId: data.userId }
    });

    if (existingStudentForUser) {
      throw new ApiError(409, "This user is already mapped as student");
    }

    const existingRegisterNumber = await prisma.student.findUnique({
      where: { registerNumber: data.registerNumber }
    });

    if (existingRegisterNumber) {
      throw new ApiError(409, "Register number already exists");
    }

    return prisma.student.create({
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

  getStudents: async () => {
    return prisma.student.findMany({
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
            courseSelections: true
          }
        }
      }
    });
  },

  getStudentById: async (id: string) => {
    const student = await prisma.student.findUnique({
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
        courseSelections: {
          include: {
            subject: true
          }
        }
      }
    });

    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    return student;
  },

  updateStudent: async (id: string, data: UpdateStudentInput) => {
    await studentService.getStudentById(id);

    if (data.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: data.departmentId }
      });

      if (!department) {
        throw new ApiError(404, "Department not found");
      }
    }

    if (data.registerNumber) {
      const duplicateStudent = await prisma.student.findFirst({
        where: {
          id: {
            not: id
          },
          registerNumber: data.registerNumber
        }
      });

      if (duplicateStudent) {
        throw new ApiError(409, "Register number already exists");
      }
    }

    return prisma.student.update({
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

  deleteStudent: async (id: string) => {
    await studentService.getStudentById(id);

    const linkedRecords = await prisma.student.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            courseSelections: true
          }
        }
      }
    });

    if (linkedRecords && linkedRecords._count.courseSelections > 0) {
      throw new ApiError(
        400,
        "Student cannot be deleted because course selections are linked"
      );
    }

    await prisma.student.delete({
      where: { id }
    });

    return null;
  }
};