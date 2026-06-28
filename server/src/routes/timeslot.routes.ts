import { Router } from "express";

import { timeslotController } from "../controllers/timeslot.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createTimeSlotSchema,
  updateTimeSlotSchema
} from "../services/timeslot.service";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorizeRoles("ADMIN", "HOD"),
  validate(createTimeSlotSchema),
  timeslotController.createTimeSlot
);

router.get(
  "/",
  authorizeRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  timeslotController.getTimeSlots
);

router.get(
  "/:id",
  authorizeRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  timeslotController.getTimeSlotById
);

router.patch(
  "/:id",
  authorizeRoles("ADMIN", "HOD"),
  validate(updateTimeSlotSchema),
  timeslotController.updateTimeSlot
);

router.delete(
  "/:id",
  authorizeRoles("ADMIN", "HOD"),
  timeslotController.deleteTimeSlot
);

export default router;

