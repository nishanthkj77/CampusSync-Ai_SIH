import { Router } from "express";

import { departmentController } from "../controllers/department.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createDepartmentSchema,
  updateDepartmentSchema
} from "../services/department.service";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorizeRoles("ADMIN"),
  validate(createDepartmentSchema),
  departmentController.createDepartment
);

router.get(
  "/",
  authorizeRoles("STUDENT", "FACULTY", "HOD", "ADMIN"),
  departmentController.getDepartments
);

router.get(
  "/:id",
  authorizeRoles("STUDENT", "FACULTY", "HOD", "ADMIN"),
  departmentController.getDepartmentById
);

router.patch(
  "/:id",
  authorizeRoles("ADMIN"),
  validate(updateDepartmentSchema),
  departmentController.updateDepartment
);

router.delete(
  "/:id",
  authorizeRoles("ADMIN"),
  departmentController.deleteDepartment
);

export default router;