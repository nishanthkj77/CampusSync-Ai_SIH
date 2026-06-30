 import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";

import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { ApiError } from "../utils/apiError";

export const aiGenerateTimetableSchema = z.object({
  academicYear: z.string().min(4, "Academic year is required"),
  semester: z.number().int().min(1).max(12),
  batchYear: z.number().int().min(2000),
  departmentId: z.string().min(1, "Department ID is required")
});

type AiGenerateTimetableInput = z.infer<typeof aiGenerateTimetableSchema>;

type AiTimetableEntry = {
  departmentId?: string;
  subjectId: string;
  facultyId: string;
  roomId: string;
  timeSlotId: string;
  semester?: number;
  batchYear?: number;
  academicYear?: string;
};

type AiConflictEntry = {
  conflictType?: string;
  type?: string;
  message: string;
  timetableIndex?: number;
  facultyId?: string;
  roomId?: string;
};

type AiEngineOutput = {
  success?: boolean;
  summary?: Record<string, unknown>;
  timetable?: AiTimetableEntry[];
  entries?: AiTimetableEntry[];
  conflicts?: AiConflictEntry[];
};

type EngineRunResult = {
  stdout: string;
  stderr: string;
  exitCode: number | null;
};

type ConflictType =
  | "FACULTY_CLASH"
  | "STUDENT_SUBJECT_CLASH"
  | "ROOM_CLASH"
  | "LAB_ALLOCATION_CLASH"
  | "WORKLOAD_CONFLICT";

const allowedConflictTypes: ConflictType[] = [
  "FACULTY_CLASH",
  "STUDENT_SUBJECT_CLASH",
  "ROOM_CLASH",
  "LAB_ALLOCATION_CLASH",
  "WORKLOAD_CONFLICT"
];

const normalizeConflictType = (type: string | undefined): ConflictType => {
  if (type && allowedConflictTypes.includes(type as ConflictType)) {
    return type as ConflictType;
  }

  return "WORKLOAD_CONFLICT";
};

const getAiPaths = async () => {
  const serverRoot = process.cwd();
  const aiEngineDir = path.resolve(serverRoot, env.AI_ENGINE_DIR);
  const runtimeDir = path.join(aiEngineDir, "runtime");
  const inputPath = path.join(runtimeDir, "input.json");
  const outputPath = path.join(runtimeDir, "output.json");

  await fs.mkdir(runtimeDir, { recursive: true });

  return {
    aiEngineDir,
    inputPath,
    outputPath
  };
};

const runPythonEngine = async (aiEngineDir: string): Promise<EngineRunResult> => {
  return new Promise((resolve, reject) => {
    const child = spawn(env.AI_ENGINE_PYTHON_COMMAND, ["-m", "app.main"], {
      cwd: aiEngineDir,
      shell: false,
      windowsHide: true,
      env: {
        ...process.env
      }
    });

    let stdout = "";
    let stderr = "";

    const timer = setTimeout(() => {
      child.kill();
      reject(new ApiError(500, "AI engine timeout exceeded"));
    }, env.AI_ENGINE_TIMEOUT_MS);

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (error) => {
      clearTimeout(timer);
      reject(new ApiError(500, `Failed to start AI engine: ${error.message}`));
    });

    child.on("close", (code) => {
      clearTimeout(timer);

      resolve({
        stdout,
        stderr,
        exitCode: code
      });
    });
  });
};

export const aiTimetableService = {
  generateWithAiEngine: async (data: AiGenerateTimetableInput) => {
    const department = await prisma.department.findUnique({
      where: {
        id: data.departmentId
      }
    });

    if (!department || !department.isActive) {
      throw new ApiError(404, "Active department not found");
    }

    const faculties = await prisma.faculty.findMany({
      where: {
        departmentId: data.departmentId,
        isAvailable: true,
        user: {
          isActive: true
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    const subjects = await prisma.subject.findMany({
      where: {
        departmentId: data.departmentId,
        isActive: true
      }
    });

    const students = await prisma.student.findMany({
      where: {
        departmentId: data.departmentId,
        semester: data.semester,
        batchYear: data.batchYear,
        isActive: true,
        user: {
          isActive: true
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    const rooms = await prisma.room.findMany({
      where: {
        isAvailable: true
      }
    });

    const timeSlots = await prisma.timeSlot.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        {
          day: "asc"
        },
        {
          startTime: "asc"
        }
      ]
    });

    const courseSelections = await prisma.courseSelection.findMany({
      where: {
        student: {
          departmentId: data.departmentId,
          semester: data.semester,
          batchYear: data.batchYear
        }
      }
    });

    if (faculties.length === 0) {
      throw new ApiError(400, "No available faculties found");
    }

    if (subjects.length === 0) {
      throw new ApiError(400, "No active subjects found");
    }

    if (rooms.length === 0) {
      throw new ApiError(400, "No available rooms found");
    }

    if (timeSlots.length === 0) {
      throw new ApiError(400, "No active time slots found");
    }

    const { aiEngineDir, inputPath, outputPath } = await getAiPaths();

    const inputPayload = {
      meta: {
        academicYear: data.academicYear,
        semester: data.semester,
        batchYear: data.batchYear,
        departmentId: data.departmentId,
        generatedAt: new Date().toISOString()
      },
      department,
      faculties,
      students,
      subjects,
      rooms,
      timeSlots,
      courseSelections,
      constraints: {
        preventFacultyClash: true,
        preventRoomClash: true,
        preventStudentSubjectClash: true,
        respectLabRequirements: true,
        respectFacultyWorkload: true
      }
    };

    await fs.writeFile(inputPath, JSON.stringify(inputPayload, null, 2), "utf-8");

    try {
      await fs.unlink(outputPath);
    } catch {
      // Ignore if output file does not exist.
    }

    const engineResult = await runPythonEngine(aiEngineDir);

    let rawOutput = "";

    try {
      rawOutput = await fs.readFile(outputPath, "utf-8");
    } catch {
      throw new ApiError(
        500,
        `AI engine did not create runtime/output.json. Exit code: ${engineResult.exitCode}`,
        {
          stdout: engineResult.stdout,
          stderr: engineResult.stderr
        }
      );
    }

    if (engineResult.exitCode !== 0) {
      console.warn("AI engine exited with non-zero code but output.json exists.");
      console.warn("Exit code:", engineResult.exitCode);
      console.warn("STDERR:", engineResult.stderr);
    }

    let parsedOutput: AiEngineOutput;

    try {
      parsedOutput = JSON.parse(rawOutput) as AiEngineOutput;
    } catch {
      throw new ApiError(500, "AI engine output.json is not valid JSON");
    }

    const aiEntries = parsedOutput.timetable ?? parsedOutput.entries ?? [];
    const aiConflicts = parsedOutput.conflicts ?? [];

    if (!Array.isArray(aiEntries)) {
      throw new ApiError(500, "AI engine timetable output must be an array");
    }

    if (!Array.isArray(aiConflicts)) {
      throw new ApiError(500, "AI engine conflicts output must be an array");
    }

    const savedResult = await prisma.$transaction(async (tx) => {
      await tx.conflictReport.deleteMany({
        where: {
          timetable: {
            departmentId: data.departmentId,
            semester: data.semester,
            batchYear: data.batchYear,
            academicYear: data.academicYear
          }
        }
      });

      await tx.timetable.deleteMany({
        where: {
          departmentId: data.departmentId,
          semester: data.semester,
          batchYear: data.batchYear,
          academicYear: data.academicYear
        }
      });

      const savedTimetables: { id: string }[] = [];

      for (const entry of aiEntries) {
        if (
          !entry.subjectId ||
          !entry.facultyId ||
          !entry.roomId ||
          !entry.timeSlotId
        ) {
          continue;
        }

        const saved = await tx.timetable.create({
          data: {
            academicYear: entry.academicYear ?? data.academicYear,
            semester: entry.semester ?? data.semester,
            batchYear: entry.batchYear ?? data.batchYear,
            departmentId: entry.departmentId ?? data.departmentId,
            subjectId: entry.subjectId,
            facultyId: entry.facultyId,
            roomId: entry.roomId,
            timeSlotId: entry.timeSlotId
          },
          select: {
            id: true
          }
        });

        savedTimetables.push(saved);
      }

      const savedConflicts: { id: string }[] = [];

      for (const conflict of aiConflicts) {
        const linkedTimetable =
          typeof conflict.timetableIndex === "number"
            ? savedTimetables[conflict.timetableIndex]
            : undefined;

        const savedConflict = await tx.conflictReport.create({
          data: {
            conflictType: normalizeConflictType(
              conflict.conflictType ?? conflict.type
            ),
            message: conflict.message,
            timetableId: linkedTimetable?.id,
            facultyId: conflict.facultyId,
            roomId: conflict.roomId
          },
          select: {
            id: true
          }
        });

        savedConflicts.push(savedConflict);
      }

      return {
        savedTimetables,
        savedConflicts
      };
    });

    const finalTimetables = await prisma.timetable.findMany({
      where: {
        departmentId: data.departmentId,
        semester: data.semester,
        batchYear: data.batchYear,
        academicYear: data.academicYear
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

    const finalConflicts = await prisma.conflictReport.findMany({
      where: {
        timetable: {
          departmentId: data.departmentId,
          semester: data.semester,
          batchYear: data.batchYear,
          academicYear: data.academicYear
        }
      }
    });

    return {
      summary: {
        academicYear: data.academicYear,
        semester: data.semester,
        batchYear: data.batchYear,
        departmentId: data.departmentId,
        aiSummary: parsedOutput.summary ?? null,
        aiExitCode: engineResult.exitCode,
        totalGeneratedEntries: savedResult.savedTimetables.length,
        totalConflicts: savedResult.savedConflicts.length
      },
      timetables: finalTimetables,
      conflicts: finalConflicts
    };
  }
};