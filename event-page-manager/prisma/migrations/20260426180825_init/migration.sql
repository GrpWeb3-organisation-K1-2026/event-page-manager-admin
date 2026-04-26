-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_speakerId_fkey";

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "speakerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_speakerId_fkey" FOREIGN KEY ("speakerId") REFERENCES "Speaker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
