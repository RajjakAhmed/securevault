import express from "express";
import { protect } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddleware";
import { uploadFile, downloadFile } from "../controllers/filecontrollers";
import { getMyFiles } from "../controllers/filecontrollers";
import { deleteFile } from "../controllers/filecontrollers";
import {
  generateShareLink,
  downloadSharedFile,
} from "../controllers/sharecontrollers";

const router = express.Router();

// Upload Route (Protected)
router.post("/upload", protect, upload.single("file"), uploadFile);
router.get("/download/:id", protect, downloadFile);
router.get("/myfiles", protect, getMyFiles);
router.delete("/delete/:id", protect, deleteFile);
router.post("/share/:id", protect, generateShareLink);
router.get("/shared/:token", downloadSharedFile);



export default router;
