 import { Router } from "express";

import authRoutes from "./auth.routes";
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

export default router;