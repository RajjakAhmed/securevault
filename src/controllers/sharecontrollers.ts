import { Request, Response } from "express";
import prisma from "../utils/prisma";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import os from "os";
import { AuthRequest } from "../middleware/authMiddleware";
import { downloadEncryptedFromStorage } from "../utils/storageDownload";
import { decryptFile } from "../encryption/decrypt";

const getTempDir = () => {
  const tempDir = path.join(os.tmpdir(), "securevault");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
};

/* ================================
   Generate Share Link (With Expiry)
================================== */
export const generateShareLink = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const fileId = String(req.params.id);
    const userId = String(req.user?.id);

    const expiryMinutes = Number(req.body?.expiryMinutes);

    if (!expiryMinutes || isNaN(expiryMinutes) || expiryMinutes < 1) {
      return res.status(400).json({
        message: "Expiry time is required (in minutes)",
      });
    }

    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) return res.status(404).json({ message: "File not found ❌" });

    if (file.ownerId !== userId)
      return res.status(403).json({ message: "Access denied ❌" });

    const token = crypto.randomBytes(24).toString("hex");

    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    await prisma.shareLink.create({
      data: {
        token,
        fileId,
        expiresAt,
      },
    });

    const shareUrl = `${process.env.BASE_URL}/api/files/shared/${token}`;

    return res.json({
      message: "Share link created ✅",
      shareUrl,
      expiresAt,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Share link generation failed ❌",
      error,
    });
  }
};

/* ----------------------------------------
   Download shared file (by token, public)
----------------------------------------- */
export const downloadSharedFile = async (req: Request, res: Response) => {
  try {
    const token = String(req.params.token);

    const share = await prisma.shareLink.findUnique({
      where: { token },
      include: { file: true },
    });

    if (!share) {
      return res.status(404).json({ message: "Share link not found ❌" });
    }

    if (share.expiresAt.getTime() < Date.now()) {
      return res.status(410).json({ message: "Share link expired ❌" });
    }

    const file = share.file;
    if (!file) {
      return res.status(404).json({ message: "File not found ❌" });
    }

    const tempDir = getTempDir();

    const encryptedTempPath = path.join(tempDir, `temp-${Date.now()}.enc`);
    const decryptedTempPath = path.join(
      tempDir,
      `decrypted-${Date.now()}-${file.filename}`
    );

    await downloadEncryptedFromStorage(file.encryptedPath, encryptedTempPath);
    await decryptFile(encryptedTempPath, decryptedTempPath);

    fs.unlinkSync(encryptedTempPath);

    res.download(decryptedTempPath, file.filename, () => {
      if (fs.existsSync(decryptedTempPath)) {
        fs.unlinkSync(decryptedTempPath);
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Shared download failed ❌",
      error,
    });
  }
};