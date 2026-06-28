import { Router } from "express";

import { facultyController } from "../controllers/faculty.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createFacultySchema,
  updateFacultySchema
} from "../services/faculty.service";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorizeRoles("ADMIN"),
  validate(createFacultySchema),
  facultyController.createFaculty
);

router.get(
  "/",
  authorizeRoles("ADMIN", "HOD", "FACULTY"),
  facultyController.getFaculties
);

router.get(
  "/:id",
  authorizeRoles("ADMIN", "HOD", "FACULTY"),
  facultyController.getFacultyById
);

router.patch(
  "/:id",
  authorizeRoles("ADMIN"),
  validate(updateFacultySchema),
  facultyController.updateFaculty
);

router.delete(
  "/:id",
  authorizeRoles("ADMIN"),
  facultyController.deleteFaculty
);

export default router;