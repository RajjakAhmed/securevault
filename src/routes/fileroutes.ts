import express from "express";
import { protect } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddleware";
import { uploadFile, downloadFile } from "../controllers/filecontrollers";

const router = express.Router();

// Upload Route (Protected)
router.post("/upload", protect, upload.single("file"), uploadFile);
router.get("/download/:id", protect, downloadFile);


export default router;
