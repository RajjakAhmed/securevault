import prisma from "./prisma";

export const logAuditEvent = async ({
  userId,
  action,
  fileId,
  ipAddress,
  metadata,
}: {
  userId?: string;
  action: string;
  fileId?: string;
  ipAddress?: string;
  metadata?: any;
}) => {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      fileId,
      ipAddress,
      metadata,
    },
  });
};
