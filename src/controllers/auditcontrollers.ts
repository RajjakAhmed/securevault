import { Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

/* ==========================================
   Get My Audit Logs (Dashboard View)
   - Shows logs done by owner
   - Shows external actions on owner's files
   - Includes File ID + Filename
========================================== */
export const getMyAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const logs = await prisma.auditLog.findMany({
      where: {
        OR: [
          { userId: userId }, // actions done by owner
          {
            file: {
              ownerId: userId, // external actions on owner files
            },
          },
        ],
      },

      // ✅ Include file details for UI
      include: {
        file: {
          select: {
            id: true,
            filename: true,
          },
        },
      },

      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return res.json({ logs });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch audit logs ❌",
      error,
    });
  }
};
