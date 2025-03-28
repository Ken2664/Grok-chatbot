-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "contentType" TEXT DEFAULT 'text',
ADD COLUMN     "imageData" TEXT,
ADD COLUMN     "imageType" TEXT;
