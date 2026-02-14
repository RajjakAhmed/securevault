import { Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

/* ==========================================
   Create Team Vault
   Role: OWNER auto assigned
========================================== */
export const createTeam = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name } = req.body;

    if (!name || name.trim().length < 3) {
      return res.status(400).json({
        message: "Team name must be at least 3 characters ❌",
      });
    }

    // ✅ Create team + add creator as OWNER
    const team = await prisma.team.create({
      data: {
        name,
        members: {
          create: {
            userId,
            role: "OWNER",
          },
        },
      },
      include: {
        members: true,
      },
    });

    return res.status(201).json({
      message: "Team Vault created successfully ✅",
      team,
    });
  } catch (error) {
    console.error("CREATE TEAM ERROR:", error);

    return res.status(500).json({
      message: "Team creation failed ❌",
      error,
    });
  }
};
