 import { Router } from "express";

import authRoutes from "./auth.routes";
import departmentRoutes from "./department.routes";
import facultyRoutes from "./faculty.routes";
import studentRoutes from "./student.routes";
import subjectRoutes from "./subject.routes";
import roomRoutes from "./room.routes";
import { ApiResponse } from "../utils/apiResponse";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json(
    new ApiResponse("CampusSync AI backend is running", {
      service: "campussync-ai-server",
      status: "healthy",
      uptime: process.uptime()
    })
  );
});

router.use("/auth", authRoutes);
router.use("/departments", departmentRoutes);
router.use("/faculties", facultyRoutes);
router.use("/students", studentRoutes);
router.use("/subjects", subjectRoutes);
router.use("/rooms", roomRoutes);

export default router;