import { Response } from "express";
import prisma from "../utils/prisma";
import { encryptFile } from "../encryption/encrypt";
import { decryptFile } from "../encryption/decrypt";
import fs from "fs";
import path from "path";
import os from "os";

import { AuthRequest } from "../middleware/authMiddleware";
import { uploadEncryptedToStorage } from "../utils/storageUpload";
import { downloadEncryptedFromStorage } from "../utils/storageDownload";
import { deleteEncryptedFromStorage } from "../utils/storageDelete";


/* ----------------------------------------
   Helper: Get Temp Folder Path
----------------------------------------- */
const getTempDir = () => {
  const tempDir = path.join(os.tmpdir(), "securevault");

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  return tempDir;
};

/* ----------------------------------------
   Upload File Controller
----------------------------------------- */
export const uploadFile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded ❌" });
    }

    const userId = req.user.id;

    // Temp directory
    const tempDir = getTempDir();

    // Uploaded file path (multer gives this)
    const uploadedPath = req.file.path;

    // Encrypted file name
    const encryptedFilename = req.file.filename + ".enc";

    // Temp encrypted file path
    const encryptedPath = path.join(tempDir, encryptedFilename);

    /* 1. Encrypt locally (temp) */
    await encryptFile(uploadedPath, encryptedPath);

    /* 2. Delete original uploaded file */
    fs.unlinkSync(uploadedPath);

    /* 3. Upload encrypted file to Supabase Storage */
    const storageKey = `encrypted/${encryptedFilename}`;

    await uploadEncryptedToStorage(encryptedPath, storageKey);

    /* 4. Delete temp encrypted file */
    fs.unlinkSync(encryptedPath);

    /* 5. Save metadata in DB */
    const savedFile = await prisma.file.create({
      data: {
        filename: req.file.originalname,
        encryptedPath: storageKey, // Supabase Storage key
        ownerId: userId,
      },
    });

    return res.status(201).json({
      message: "File uploaded + encrypted + stored in Supabase ✅🔐",
      file: savedFile,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Upload failed ❌",
      error,
    });
  }
};

/* ----------------------------------------
   Download File Controller
----------------------------------------- */
export const downloadFile = async (req: AuthRequest, res: Response) => {
  try {
    const fileId = String(req.params.id);
    const userId = req.user.id;

    /* 1. Find file metadata */
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return res.status(404).json({ message: "File not found ❌" });
    }

    /* 2. Ownership check */
    if (file.ownerId !== userId) {
      return res.status(403).json({ message: "Access denied ❌" });
    }

    // Temp directory
    const tempDir = getTempDir();

    /* Supabase storage key */
    const storageKey = file.encryptedPath;

    /* Temp encrypted + decrypted paths */
    const encryptedTempPath = path.join(
      tempDir,
      `temp-${Date.now()}.enc`
    );

    const decryptedTempPath = path.join(
      tempDir,
      `decrypted-${Date.now()}-${file.filename}`
    );

    /* 3. Download encrypted file from Supabase */
    await downloadEncryptedFromStorage(storageKey, encryptedTempPath);

    /* 4. Decrypt locally */
    await decryptFile(encryptedTempPath, decryptedTempPath);

    /* 5. Delete encrypted temp file */
    fs.unlinkSync(encryptedTempPath);

    /* 6. Send decrypted file */
    res.download(decryptedTempPath, file.filename, () => {
      // Cleanup decrypted file after download
      if (fs.existsSync(decryptedTempPath)) {
        fs.unlinkSync(decryptedTempPath);
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Download failed ❌",
      error,
    });
  }
};
export const getMyFiles = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;

    const files = await prisma.file.findMany({
      where: { ownerId: userId },
      orderBy: { uploadedAt: "desc" },
    });

    return res.json({
      message: "Files fetched successfully ✅",
      files,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch files ❌",
      error,
    });
  }
};
export const deleteFile = async (req: AuthRequest, res: Response) => {
  try {
    const fileId = String(req.params.id);
    const userId = req.user.id;

    // 1. Find file
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return res.status(404).json({ message: "File not found ❌" });
    }

    // 2. Ownership check
    if (file.ownerId !== userId) {
      return res.status(403).json({ message: "Access denied ❌" });
    }

    // ✅ 3. Delete share links first (IMPORTANT FIX)
    await prisma.shareLink.deleteMany({
      where: { fileId },
    });

    // ✅ 4. Delete encrypted file from Supabase Storage
    await deleteEncryptedFromStorage(file.encryptedPath);

    // ✅ 5. Delete file record from DB
    await prisma.file.delete({
      where: { id: fileId },
    });

    return res.json({
      message: "File deleted permanently ✅",
    });
  } catch (error) {
    console.error("DELETE ERROR:", error);

    return res.status(500).json({
      message: "Delete failed ❌",
      error: String(error),
    });
  }
};

