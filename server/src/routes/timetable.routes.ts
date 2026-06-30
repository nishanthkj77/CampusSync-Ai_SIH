 import { Router } from "express";

import { timetableController } from "../controllers/timetable.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { generateTimetableSchema } from "../services/timetable.service";
import { aiGenerateTimetableSchema } from "../services/aiTimetable.service";

const router = Router();

router.use(authenticate);

router.post(
  "/generate-ai",
  authorizeRoles("ADMIN", "HOD"),
  validate(aiGenerateTimetableSchema),
  timetableController.generateTimetableWithAi
);

router.post(
  "/generate",
  authorizeRoles("ADMIN", "HOD"),
  validate(generateTimetableSchema),
  timetableController.generateTimetableEntry
);

router.get(
  "/",
  authorizeRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  timetableController.getTimetables
);

router.get(
  "/student/:studentId",
  authorizeRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  timetableController.getStudentTimetable
);

router.get(
  "/faculty/:facultyId",
  authorizeRoles("ADMIN", "HOD", "FACULTY"),
  timetableController.getFacultyTimetable
);

router.get(
  "/room/:roomId",
  authorizeRoles("ADMIN", "HOD", "FACULTY"),
  timetableController.getRoomTimetable
);

router.get(
  "/:id",
  authorizeRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  timetableController.getTimetableById
);

export default router;