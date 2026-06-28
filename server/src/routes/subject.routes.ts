import { Router } from "express";

import { subjectController } from "../controllers/subject.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createSubjectSchema,
  updateSubjectSchema
} from "../services/subject.service";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorizeRoles("ADMIN", "HOD"),
  validate(createSubjectSchema),
  subjectController.createSubject
);

router.get(
  "/",
  authorizeRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  subjectController.getSubjects
);

router.get(
  "/:id",
  authorizeRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  subjectController.getSubjectById
);

router.patch(
  "/:id",
  authorizeRoles("ADMIN", "HOD"),
  validate(updateSubjectSchema),
  subjectController.updateSubject
);

router.delete(
  "/:id",
  authorizeRoles("ADMIN", "HOD"),
  subjectController.deleteSubject
);

export default router;
