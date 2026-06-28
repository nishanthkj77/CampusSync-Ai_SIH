import { Router } from "express";

import { studentController } from "../controllers/student.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createStudentSchema,
  updateStudentSchema
} from "../services/student.service";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorizeRoles("ADMIN"),
  validate(createStudentSchema),
  studentController.createStudent
);

router.get(
  "/",
  authorizeRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  studentController.getStudents
);

router.get(
  "/:id",
  authorizeRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  studentController.getStudentById
);

router.patch(
  "/:id",
  authorizeRoles("ADMIN"),
  validate(updateStudentSchema),
  studentController.updateStudent
);

router.delete(
  "/:id",
  authorizeRoles("ADMIN"),
  studentController.deleteStudent
);

export default router;