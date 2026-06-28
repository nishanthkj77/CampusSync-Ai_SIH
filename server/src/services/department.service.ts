import { z } from "zod";

import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";

export const createDepartmentSchema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters"),
  code: z.string().min(2, "Department code must be at least 2 characters")
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters").optional(),
  code: z.string().min(2, "Department code must be at least 2 characters").optional(),
  isActive: z.boolean().optional()
});

type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;

export const departmentService = {
  createDepartment: async (data: CreateDepartmentInput) => {
    const existingDepartment = await prisma.department.findFirst({
      where: {
        OR: [{ name: data.name }, { code: data.code }]
      }
    });

    if (existingDepartment) {
      throw new ApiError(409, "Department name or code already exists");
    }

    return prisma.department.create({
      data,
      select: {
        id: true,
        name: true,
        code: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
  },

  getDepartments: async () => {
    return prisma.department.findMany({
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        name: true,
        code: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
  },

  getDepartmentById: async (id: string) => {
    const department = await prisma.department.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        code: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!department) {
      throw new ApiError(404, "Department not found");
    }

    return department;
  },

  updateDepartment: async (id: string, data: UpdateDepartmentInput) => {
    await departmentService.getDepartmentById(id);

    if (data.name || data.code) {
      const duplicateDepartment = await prisma.department.findFirst({
        where: {
          id: {
            not: id
          },
          OR: [
            data.name ? { name: data.name } : undefined,
            data.code ? { code: data.code } : undefined
          ].filter(Boolean) as { name?: string; code?: string }[]
        }
      });

      if (duplicateDepartment) {
        throw new ApiError(409, "Department name or code already exists");
      }
    }

    return prisma.department.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        code: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
  },

  deleteDepartment: async (id: string) => {
    await departmentService.getDepartmentById(id);

    const linkedRecords = await prisma.department.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            faculties: true,
            students: true,
            subjects: true
          }
        }
      }
    });

    if (
      linkedRecords &&
      (linkedRecords._count.faculties > 0 ||
        linkedRecords._count.students > 0 ||
        linkedRecords._count.subjects > 0)
    ) {
      throw new ApiError(
        400,
        "Department cannot be deleted because it is linked with faculty, students, or subjects"
      );
    }

    await prisma.department.delete({
      where: { id }
    });

    return null;
  }
};
