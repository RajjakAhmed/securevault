-- DropForeignKey
ALTER TABLE "ShareLink" DROP CONSTRAINT "ShareLink_fileId_fkey";

-- AlterTable
ALTER TABLE "ShareLink" ADD COLUMN     "passwordHash" TEXT;

-- AddForeignKey
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
