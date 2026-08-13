/*
  Warnings:

  - A unique constraint covering the columns `[invitationTokenId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "invitationTokenId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_invitationTokenId_key" ON "users"("invitationTokenId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_invitationTokenId_fkey" FOREIGN KEY ("invitationTokenId") REFERENCES "invitations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
