import { Request, Response } from "express";
import prisma from "../utils/prisma";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import os from "os";
import bcrypt from "bcrypt";

import { AuthRequest } from "../middleware/authMiddleware";
import { downloadEncryptedFromStorage } from "../utils/storageDownload";
import { decryptFile } from "../encryption/decrypt";
import { logAuditEvent } from "../utils/auditLogger";

/* ================================
   TEMP DIRECTORY HELPER
================================== */
const getTempDir = () => {
  const tempDir = path.join(os.tmpdir(), "securevault");

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  return tempDir;
};

/* ==========================================
   Generate Share Link (Expiry + Password)
========================================== */
export const generateShareLink = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const fileId = String(req.params.id);
    const userId = String(req.user?.id);

    const expiryMinutes = Number(req.body?.expiryMinutes);

    // ✅ Optional password
    const password = req.body?.password;

    // ✅ Owner decides unlock time (default 2 min)
    const unlockMinutes = Number(req.body?.unlockMinutes) || 2;

    if (!expiryMinutes || isNaN(expiryMinutes) || expiryMinutes < 1) {
      return res.status(400).json({
        message: "Expiry time is required (in minutes)",
      });
    }

    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return res.status(404).json({ message: "File not found ❌" });
    }

    if (file.ownerId !== userId) {
      return res.status(403).json({ message: "Access denied ❌" });
    }

    // ✅ Generate secure token
    const token = crypto.randomBytes(24).toString("hex");

    // ✅ Expiry timestamp
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // ✅ Hash password if provided
    let passwordHash: string | null = null;

    if (password && password.length > 0) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    // ✅ Save share link
    await prisma.shareLink.create({
      data: {
        token,
        fileId,
        expiresAt,
        passwordHash,
        unlockMinutes,
      },
    });
        // ✅ Audit Log: Share Link Created
    await logAuditEvent({
      userId,
      action: "SHARE_LINK_CREATED",
      fileId,
      ipAddress: req.ip,
      metadata: {
        expiresAt,
        passwordProtected: !!passwordHash,
        unlockMinutes,
      },
    });


    const shareUrl = `${process.env.BASE_URL}/api/files/shared/${token}`;

    return res.json({
      message: "Share link created ✅",
      shareUrl,
      expiresAt,
      passwordProtected: !!passwordHash,
      unlockMinutes,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Share link generation failed ❌",
      error,
    });
  }
};

/* ==========================================
   Verify Password → Generate One-Time Token
========================================== */
export const verifyShareLinkPassword = async (
  req: Request,
  res: Response
) => {
  try {
    const token = String(req.params.token);
    const { password } = req.body;

    const share = await prisma.shareLink.findUnique({
      where: { token },
    });

    if (!share) {
      return res.status(404).json({ message: "Share link not found ❌" });
    }

    // ✅ Expiry check
    if (share.expiresAt.getTime() < Date.now()) {
      return res.status(410).json({ message: "Share link expired ❌" });
    }

    // ✅ No password required
    if (!share.passwordHash) {
      return res.json({
        ok: true,
        message: "No password required ✅",
      });
    }

    // ✅ Password required but missing
    if (!password) {
      return res.status(400).json({
        message: "Password is required ❌",
      });
    }

    // ✅ Compare password
    const match = await bcrypt.compare(password, share.passwordHash);

    if (!match) {
      return res.status(401).json({
        message: "Invalid password ❌",
      });
    }
    // ✅ Audit Log: Password Verified Successfully
    await logAuditEvent({
      action: "SHARE_PASSWORD_VERIFIED",
      fileId: share.fileId,
      ipAddress: req.ip,
      metadata: {
        token,
        validForMinutes: share.unlockMinutes || 2,
      },
    });


    // ✅ Generate one-time download token
    const downloadToken = crypto.randomBytes(16).toString("hex");

    // ✅ Token validity set by owner
    const validMinutes = share.unlockMinutes || 2;

    const tokenExpiry = new Date(Date.now() + validMinutes * 60 * 1000);

    // ✅ Store token temporarily
    await prisma.shareLink.update({
      where: { token },
      data: {
        downloadToken,
        tokenExpiresAt: tokenExpiry,
      },
    });

    return res.json({
      ok: true,
      message: "Password verified ✅",
      downloadToken,
      validForMinutes: validMinutes,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Password verification failed ❌",
      error,
    });
  }
};

/* ==========================================
   Download Shared File (One-Time Token)
========================================== */
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

    // ✅ Expiry check
    if (share.expiresAt.getTime() < Date.now()) {
      return res.status(410).json({ message: "Share link expired ❌" });
    }

    // ✅ File exists check
    const file = share.file;
    if (!file) {
      return res.status(404).json({ message: "File not found ❌" });
    }

    // ✅ If password protected, require one-time access token
    if (share.passwordHash) {
      const accessToken = String(req.query.access || "");

      if (
        !accessToken ||
        accessToken !== share.downloadToken ||
        !share.tokenExpiresAt ||
        share.tokenExpiresAt.getTime() < Date.now()
      ) {
        return res.status(401).json({
          message: "Valid one-time download token required ❌",
        });
      }

      // ✅ Audit Log FIRST (Download Access Confirmed)
      await logAuditEvent({
        action: "SHARED_FILE_DOWNLOADED",
        fileId: share.fileId,
        ipAddress: req.ip,
        metadata: {
          token,
          filename: file.filename,
        },
      });

      // ✅ One-time use: invalidate token AFTER logging
      await prisma.shareLink.update({
        where: { token },
        data: {
          downloadToken: null,
          tokenExpiresAt: null,
        },
      });
    }

    // ✅ Temp paths
    const tempDir = getTempDir();

    const encryptedTempPath = path.join(tempDir, `temp-${Date.now()}.enc`);

    const decryptedTempPath = path.join(
      tempDir,
      `decrypted-${Date.now()}-${file.filename}`
    );

    // ✅ Download encrypted file
    await downloadEncryptedFromStorage(file.encryptedPath, encryptedTempPath);

    // ✅ Decrypt before sending
    await decryptFile(encryptedTempPath, decryptedTempPath);

    // Remove encrypted temp file
    fs.unlinkSync(encryptedTempPath);

    // ✅ Send decrypted file
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
