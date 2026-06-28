import { Router } from "express";

import { courseSelectionController } from "../controllers/courseSelection.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { createCourseSelectionSchema } from "../services/courseSelection.service";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorizeRoles("ADMIN", "HOD", "STUDENT"),
  validate(createCourseSelectionSchema),
  courseSelectionController.createCourseSelection
);

router.get(
  "/",
  authorizeRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  courseSelectionController.getCourseSelections
);

router.get(
  "/student/:studentId",
  authorizeRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  courseSelectionController.getSelectionsByStudentId
);

router.get(
  "/:id",
  authorizeRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  courseSelectionController.getCourseSelectionById
);

router.delete(
  "/:id",
  authorizeRoles("ADMIN", "HOD", "STUDENT"),
  courseSelectionController.deleteCourseSelection
);

export default router;
