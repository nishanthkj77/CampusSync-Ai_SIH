import { Router } from "express";

import { roomController } from "../controllers/room.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createRoomSchema,
  updateRoomSchema
} from "../services/room.service";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorizeRoles("ADMIN", "HOD"),
  validate(createRoomSchema),
  roomController.createRoom
);

router.get(
  "/",
  authorizeRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  roomController.getRooms
);

router.get(
  "/:id",
  authorizeRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  roomController.getRoomById
);

router.patch(
  "/:id",
  authorizeRoles("ADMIN", "HOD"),
  validate(updateRoomSchema),
  roomController.updateRoom
);

router.delete(
  "/:id",
  authorizeRoles("ADMIN", "HOD"),
  roomController.deleteRoom
);

export default router;

