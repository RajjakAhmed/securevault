-- AlterTable
ALTER TABLE "ShareLink" ADD COLUMN     "downloadToken" TEXT,
ADD COLUMN     "tokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "unlockMinutes" INTEGER;
