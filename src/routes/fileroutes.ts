import express from "express";
import { protect } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddleware";
import { getMyAuditLogs } from "../controllers/auditcontrollers";



import {
  uploadFile,
  downloadFile,
  getMyFiles,
  deleteFile,
} from "../controllers/filecontrollers";

import {
  generateShareLink,
  downloadSharedFile,
  verifyShareLinkPassword,
} from "../controllers/sharecontrollers";

const router = express.Router();

/* ================================
   FILE ROUTES (Protected)
================================ */

// Upload File
router.post("/upload", protect, upload.single("file"), uploadFile);

// Download File (Owner only)
router.get("/download/:id", protect, downloadFile);

// Get My Files
router.get("/myfiles", protect, getMyFiles);

// Delete File
router.delete("/delete/:id", protect, deleteFile);

/* ================================
   SHARE ROUTES
================================ */

// Generate Share Link (Protected)
router.post("/share/:id", protect, generateShareLink);

// Verify Password Before Download (Public)
router.post("/shared/:token/verify", verifyShareLinkPassword);

// Download Shared File (Public)
router.get("/shared/:token", downloadSharedFile);
router.get("/audit/logs", protect, getMyAuditLogs);

export default router;
