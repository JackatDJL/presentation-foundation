/*
  Warnings:

  - Made the column `ownerId` on table `presentations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ownerId` on table `files` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "data"."presentations" ALTER COLUMN "ownerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "files"."files" ALTER COLUMN "ownerId" SET NOT NULL;
