import express from "express";
import { protect } from "../middleware/authMiddleware";
import { createTeam } from "../controllers/teamcontroller";

const router = express.Router();

/* ==========================
   Team Vault Routes
========================== */

// ✅ Create Team
router.post("/create", protect, createTeam);

export default router;
