import { z } from "zod";

import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";

export const createCourseSelectionSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  subjectId: z.string().min(1, "Subject ID is required"),
  choiceType: z.enum(["MAJOR", "MINOR", "SKILL", "VALUE_ADDED", "ELECTIVE"])
});

type CreateCourseSelectionInput = z.infer<typeof createCourseSelectionSchema>;

export const courseSelectionService = {
  createCourseSelection: async (data: CreateCourseSelectionInput) => {
    const student = await prisma.student.findUnique({
      where: { id: data.studentId },
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

    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    if (!student.isActive || !student.user.isActive) {
      throw new ApiError(400, "Student is inactive");
    }

    const subject = await prisma.subject.findUnique({
      where: { id: data.subjectId },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    if (!subject) {
      throw new ApiError(404, "Subject not found");
    }

    if (!subject.isActive) {
      throw new ApiError(400, "Subject is not active");
    }

    if (subject.courseType !== data.choiceType) {
      throw new ApiError(
        400,
        `Choice type must match subject course type: ${subject.courseType}`
      );
    }

    const existingSelection = await prisma.courseSelection.findUnique({
      where: {
        studentId_subjectId: {
          studentId: data.studentId,
          subjectId: data.subjectId
        }
      }
    });

    if (existingSelection) {
      throw new ApiError(409, "Student has already selected this subject");
    }

    return prisma.courseSelection.create({
      data,
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
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
        },
        subject: {
          include: {
            department: {
              select: {
                id: true,
                name: true,
                code: true
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
            }
          }
        }
      }
    });
  },

  getCourseSelections: async () => {
    return prisma.courseSelection.findMany({
      orderBy: {
        createdAt: "desc"
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
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
        },
        subject: {
          include: {
            department: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        }
      }
    });
  },

  getCourseSelectionById: async (id: string) => {
    const selection = await prisma.courseSelection.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            department: true
          }
        },
        subject: {
          include: {
            department: true,
            faculty: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!selection) {
      throw new ApiError(404, "Course selection not found");
    }

    return selection;
  },

  getSelectionsByStudentId: async (studentId: string) => {
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    return prisma.courseSelection.findMany({
      where: { studentId },
      orderBy: {
        createdAt: "desc"
      },
      include: {
        subject: {
          include: {
            department: {
              select: {
                id: true,
                name: true,
                code: true
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
            }
          }
        }
      }
    });
  },

  deleteCourseSelection: async (id: string) => {
    await courseSelectionService.getCourseSelectionById(id);

    await prisma.courseSelection.delete({
      where: { id }
    });

    return null;
  }
};
