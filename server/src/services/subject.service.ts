import { z } from "zod";

import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";

export const createSubjectSchema = z.object({
  name: z.string().min(2, "Subject name must be at least 2 characters"),
  code: z.string().min(2, "Subject code must be at least 2 characters"),
  courseType: z.enum(["MAJOR", "MINOR", "SKILL", "VALUE_ADDED", "ELECTIVE"]),
  creditHours: z.number().int().positive("Credit hours must be positive"),
  labRequired: z.boolean().default(false),
  departmentId: z.string().min(1, "Department ID is required"),
  facultyId: z.string().min(1).optional()
});

export const updateSubjectSchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().min(2).optional(),
  courseType: z.enum(["MAJOR", "MINOR", "SKILL", "VALUE_ADDED", "ELECTIVE"]).optional(),
  creditHours: z.number().int().positive().optional(),
  labRequired: z.boolean().optional(),
  isActive: z.boolean().optional(),
  departmentId: z.string().min(1).optional(),
  facultyId: z.string().min(1).nullable().optional()
});

type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;

export const subjectService = {
  createSubject: async (data: CreateSubjectInput) => {
    const department = await prisma.department.findUnique({
      where: { id: data.departmentId }
    });

    if (!department) {
      throw new ApiError(404, "Department not found");
    }

    const existingSubject = await prisma.subject.findUnique({
      where: { code: data.code }
    });

    if (existingSubject) {
      throw new ApiError(409, "Subject code already exists");
    }

    if (data.facultyId) {
      const faculty = await prisma.faculty.findUnique({
        where: { id: data.facultyId }
      });

      if (!faculty) {
        throw new ApiError(404, "Faculty not found");
      }
    }

    return prisma.subject.create({
      data,
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        faculty: {
          select: {
            id: true,
            employeeCode: true,
            designation: true,
            user: {
              select: {
                name: true,
                email: true,
                role: true
              }
            }
          }
        }
      }
    });
  },

  getSubjects: async () => {
    return prisma.subject.findMany({
      orderBy: {
        createdAt: "desc"
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        faculty: {
          select: {
            id: true,
            employeeCode: true,
            designation: true,
            user: {
              select: {
                name: true,
                email: true,
                role: true
              }
            }
          }
        },
        _count: {
          select: {
            courseSelections: true,
            timetables: true
          }
        }
      }
    });
  },

  getSubjectById: async (id: string) => {
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        faculty: {
          select: {
            id: true,
            employeeCode: true,
            designation: true,
            user: {
              select: {
                name: true,
                email: true,
                role: true
              }
            }
          }
        },
        courseSelections: true,
        timetables: true
      }
    });

    if (!subject) {
      throw new ApiError(404, "Subject not found");
    }

    return subject;
  },

  updateSubject: async (id: string, data: UpdateSubjectInput) => {
    await subjectService.getSubjectById(id);

    if (data.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: data.departmentId }
      });

      if (!department) {
        throw new ApiError(404, "Department not found");
      }
    }

    if (data.facultyId) {
      const faculty = await prisma.faculty.findUnique({
        where: { id: data.facultyId }
      });

      if (!faculty) {
        throw new ApiError(404, "Faculty not found");
      }
    }

    if (data.code) {
      const duplicateSubject = await prisma.subject.findFirst({
        where: {
          id: {
            not: id
          },
          code: data.code
        }
      });

      if (duplicateSubject) {
        throw new ApiError(409, "Subject code already exists");
      }
    }

    return prisma.subject.update({
      where: { id },
      data,
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        faculty: {
          select: {
            id: true,
            employeeCode: true,
            designation: true,
            user: {
              select: {
                name: true,
                email: true,
                role: true
              }
            }
          }
        }
      }
    });
  },

  deleteSubject: async (id: string) => {
    await subjectService.getSubjectById(id);

    const linkedRecords = await prisma.subject.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            courseSelections: true,
            timetables: true
          }
        }
      }
    });

    if (
      linkedRecords &&
      (linkedRecords._count.courseSelections > 0 ||
        linkedRecords._count.timetables > 0)
    ) {
      throw new ApiError(
        400,
        "Subject cannot be deleted because it is linked with course selections or timetables"
      );
    }

    await prisma.subject.delete({
      where: { id }
    });

    return null;
  }
};