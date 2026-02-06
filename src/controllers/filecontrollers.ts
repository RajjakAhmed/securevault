import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { encryptFile } from "../encryption/encrypt";
import { decryptFile } from "../encryption/decrypt";
import fs from "fs";
import path from "path";
import { AuthRequest } from "../middleware/authMiddleware";

export const uploadFile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.user.id;

    const uploadedPath = req.file.path;

    // Encrypted file path
    const encryptedFilename = req.file.filename + ".enc";
    const encryptedPath = path.join("src/uploads", encryptedFilename);

    // Encrypt file
    encryptFile(uploadedPath, encryptedPath);

    // Delete original uploaded file
    fs.unlinkSync(uploadedPath);

    // Save metadata in DB
    const savedFile = await prisma.file.create({
      data: {
        filename: req.file.originalname,
        encryptedPath: encryptedPath,
        ownerId: userId,
      },
    });

    return res.status(201).json({
      message: "File uploaded and encrypted successfully 🔐",
      file: savedFile,
    });
  } catch (error) {
    return res.status(500).json({ message: "Upload failed", error });
  }
  
};
export const downloadFile = async (req: AuthRequest, res: Response) => {
  try {
    const fileId = String(req.params.id);
    const userId = req.user.id;

    // 1. Find file in DB
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

    const encryptedPath = file.encryptedPath;

    // 3. Temporary decrypted file path
    const tempDecryptedPath = path.join(
      "src/uploads",
      `decrypted-${Date.now()}-${file.filename}`
    );

    // 4. Decrypt file
    decryptFile(encryptedPath, tempDecryptedPath);

    // 5. Wait until file exists, then send
    setTimeout(() => {
      res.download(tempDecryptedPath, file.filename, (err) => {
        // Delete temp decrypted file after download
        if (fs.existsSync(tempDecryptedPath)) {
          fs.unlinkSync(tempDecryptedPath);
        }
      });
    }, 300);
  } catch (error) {
    return res.status(500).json({
      message: "Download failed",
      error,
    });
  }
};
