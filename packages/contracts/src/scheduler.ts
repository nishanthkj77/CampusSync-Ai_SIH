import { z } from "zod";

export const dayOfWeekSchema = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
]);

export const courseTypeSchema = z.enum([
  "CORE",
  "ELECTIVE",
  "LAB",
  "PROJECT",
  "SEMINAR",
  "SKILL",
  "VALUE_ADDED",
]);

export const roomTypeSchema = z.enum([
  "CLASSROOM",
  "LAB",
  "SEMINAR_HALL",
  "AUDITORIUM",
]);

export const solverStatusSchema = z.enum([
  "OPTIMAL",
  "FEASIBLE",
  "INFEASIBLE",
  "UNKNOWN",
  "ERROR",
]);

const uuidSchema = z.uuid();

export const scheduleContextSchema = z.object({
  scheduleRunId: uuidSchema,
  academicTermId: uuidSchema,
  departmentId: uuidSchema,
  programId: uuidSchema.optional(),
  sectionId: uuidSchema.optional(),
});

export const schedulerTimeSlotSchema = z
  .object({
    id: uuidSchema,
    day: dayOfWeekSchema,
    startMinute: z.int().min(0).max(1439),
    endMinute: z.int().min(1).max(1440),
    label: z.string().trim().min(1).optional(),
  })
  .refine((slot) => slot.endMinute > slot.startMinute, {
    message: "endMinute must be greater than startMinute",
  });

export const schedulerFacultySchema = z.object({
  id: uuidSchema,
  maxWeeklyMinutes: z.int().positive(),
  unavailableTimeSlotIds: z.array(uuidSchema).default([]),
  preferredTimeSlotIds: z.array(uuidSchema).default([]),
});

export const schedulerRoomSchema = z.object({
  id: uuidSchema,
  roomType: roomTypeSchema,
  capacity: z.int().positive(),
  unavailableTimeSlotIds: z.array(uuidSchema).default([]),
});

export const schedulerCourseOfferingSchema = z.object({
  id: uuidSchema,
  offeringCode: z.string().trim().min(1),
  courseCode: z.string().trim().min(1),
  title: z.string().trim().min(1),
  courseType: courseTypeSchema,
  sectionId: uuidSchema.optional(),
  weeklySessions: z.int().positive(),
  sessionDurationMinutes: z.int().positive(),
  requiresLab: z.boolean(),
  expectedEnrollment: z.int().nonnegative(),
  eligibleFacultyIds: z.array(uuidSchema).min(1),
  studentIds: z.array(uuidSchema).default([]),
});

export const lockedScheduleEntrySchema = z.object({
  courseOfferingId: uuidSchema,
  sessionIndex: z.int().nonnegative(),
  facultyId: uuidSchema,
  roomId: uuidSchema,
  timeSlotId: uuidSchema,
  sectionId: uuidSchema.optional(),
});

export const schedulingWeightsSchema = z.object({
  unscheduledSession: z.int().nonnegative().default(1000),
  facultyPreference: z.int().nonnegative().default(10),
  minimizeFacultyGaps: z.int().nonnegative().default(5),
  minimizeStudentGaps: z.int().nonnegative().default(5),
  balanceDailyLoad: z.int().nonnegative().default(3),
  roomStability: z.int().nonnegative().default(2),
});

export const schedulingRulesSchema = z.object({
  maxFacultyDailyMinutes: z.int().positive().optional(),
  maxSectionDailySessions: z.int().positive().optional(),
  enforceRoomCapacity: z.boolean().default(true),
  enforceLabRooms: z.boolean().default(true),
  enforceFacultyAvailability: z.boolean().default(true),
  enforceRoomAvailability: z.boolean().default(true),
  weights: schedulingWeightsSchema.default({}),
});

export const scheduleGenerationRequestSchema = z.object({
  contractVersion: z.literal("1.0"),
  context: scheduleContextSchema,
  courseOfferings: z.array(schedulerCourseOfferingSchema).min(1),
  faculty: z.array(schedulerFacultySchema).min(1),
  rooms: z.array(schedulerRoomSchema).min(1),
  timeSlots: z.array(schedulerTimeSlotSchema).min(1),
  lockedEntries: z.array(lockedScheduleEntrySchema).default([]),
  rules: schedulingRulesSchema.default({}),
});

export const generatedScheduleEntrySchema = lockedScheduleEntrySchema;

export const schedulerIssueSchema = z.object({
  code: z.string().trim().min(1),
  severity: z.enum(["INFO", "WARNING", "ERROR"]),
  message: z.string().trim().min(1),
  courseOfferingId: uuidSchema.optional(),
  details: z.record(z.string(), z.unknown()).optional(),
});

export const scheduleGenerationResultSchema = z.object({
  contractVersion: z.literal("1.0"),
  scheduleRunId: uuidSchema,
  status: solverStatusSchema,
  objectiveScore: z.number().finite().optional(),
  entries: z.array(generatedScheduleEntrySchema),
  issues: z.array(schedulerIssueSchema),
  metrics: z.object({
    requestedSessions: z.int().nonnegative(),
    scheduledSessions: z.int().nonnegative(),
    unscheduledSessions: z.int().nonnegative(),
    solveTimeMs: z.int().nonnegative(),
  }),
});

export type ScheduleGenerationRequest = z.infer<
  typeof scheduleGenerationRequestSchema
>;
export type ScheduleGenerationResult = z.infer<
  typeof scheduleGenerationResultSchema
>;
