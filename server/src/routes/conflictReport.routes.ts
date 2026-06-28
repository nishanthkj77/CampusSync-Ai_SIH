import { Router } from "express";

import { conflictReportController } from "../controllers/conflictReport.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { resolveConflictSchema } from "../services/conflictReport.service";

const router = Router();

router.use(authenticate);

router.post(
  "/scan",
  authorizeRoles("ADMIN", "HOD"),
  conflictReportController.scanConflicts
);

router.get(
  "/",
  authorizeRoles("ADMIN", "HOD", "FACULTY"),
  conflictReportController.getConflictReports
);

router.get(
  "/:id",
  authorizeRoles("ADMIN", "HOD", "FACULTY"),
  conflictReportController.getConflictReportById
);

router.patch(
  "/:id/resolve",
  authorizeRoles("ADMIN", "HOD"),
  validate(resolveConflictSchema),
  conflictReportController.resolveConflictReport
);

router.delete(
  "/:id",
  authorizeRoles("ADMIN"),
  conflictReportController.deleteConflictReport
);

export default router;
