import { Router } from "express";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CampusSync AI backend is running",
    data: {
      service: "campussync-ai-server",
      status: "healthy",
      uptime: process.uptime()
    }
  });
});

export default router;