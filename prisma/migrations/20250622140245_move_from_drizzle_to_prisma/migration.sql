-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "data";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "files";

-- CreateEnum
CREATE TYPE "files"."file_types" AS ENUM ('logo', 'cover', 'presentation', 'handout', 'research');

-- CreateEnum
CREATE TYPE "data"."visibility_types" AS ENUM ('public', 'private');

-- CreateEnum
CREATE TYPE "files"."fileStorage_types" AS ENUM ('utfs', 'blob');

-- CreateEnum
CREATE TYPE "files"."fileTransfer_types" AS ENUM ('idle', 'queued', 'in_progress');

-- CreateTable
CREATE TABLE "files"."files" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileType" "files"."file_types" NOT NULL,
    "dataType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "ufsKey" VARCHAR(48),
    "blobPath" TEXT,
    "url" TEXT NOT NULL,
    "storedIn" "files"."fileStorage_types" NOT NULL DEFAULT 'utfs',
    "targetStorage" "files"."fileStorage_types" NOT NULL DEFAULT 'blob',
    "transferStatus" "files"."fileTransfer_types" NOT NULL DEFAULT 'idle',
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT,
    "presentationId" TEXT NOT NULL,
    "owner" VARCHAR(32) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data"."presentations" (
    "id" TEXT NOT NULL,
    "shortname" VARCHAR(25) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "logoId" TEXT,
    "coverId" TEXT,
    "presentationId" TEXT,
    "handoutId" TEXT,
    "researchId" TEXT,
    "kahootPin" TEXT,
    "kahootId" TEXT,
    "credits" TEXT,
    "visibility" "data"."visibility_types" NOT NULL DEFAULT 'private',
    "owner" VARCHAR(32) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "presentations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "files_id_idx" ON "files"."files"("id");

-- CreateIndex
CREATE INDEX "files_presentationId_idx" ON "files"."files"("presentationId");

-- CreateIndex
CREATE INDEX "files_owner_idx" ON "files"."files"("owner");

-- CreateIndex
CREATE INDEX "files_fileType_presentationId_idx" ON "files"."files"("fileType", "presentationId");

-- CreateIndex
CREATE UNIQUE INDEX "presentations_shortname_key" ON "data"."presentations"("shortname");

-- CreateIndex
CREATE UNIQUE INDEX "presentations_logoId_key" ON "data"."presentations"("logoId");

-- CreateIndex
CREATE UNIQUE INDEX "presentations_coverId_key" ON "data"."presentations"("coverId");

-- CreateIndex
CREATE UNIQUE INDEX "presentations_presentationId_key" ON "data"."presentations"("presentationId");

-- CreateIndex
CREATE UNIQUE INDEX "presentations_handoutId_key" ON "data"."presentations"("handoutId");

-- CreateIndex
CREATE UNIQUE INDEX "presentations_researchId_key" ON "data"."presentations"("researchId");

-- CreateIndex
CREATE INDEX "presentations_id_idx" ON "data"."presentations"("id");

-- CreateIndex
CREATE INDEX "presentations_shortname_idx" ON "data"."presentations"("shortname");

-- CreateIndex
CREATE INDEX "presentations_owner_idx" ON "data"."presentations"("owner");

-- CreateIndex
CREATE INDEX "presentations_owner_visibility_idx" ON "data"."presentations"("owner", "visibility");

-- CreateIndex
CREATE INDEX "presentations_visibility_idx" ON "data"."presentations"("visibility");

-- CreateIndex
CREATE INDEX "presentations_kahootPin_idx" ON "data"."presentations"("kahootPin");

-- CreateIndex
CREATE INDEX "presentations_kahootId_idx" ON "data"."presentations"("kahootId");

-- AddForeignKey
ALTER TABLE "files"."files" ADD CONSTRAINT "files_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "data"."presentations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."presentations" ADD CONSTRAINT "presentations_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "files"."files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."presentations" ADD CONSTRAINT "presentations_coverId_fkey" FOREIGN KEY ("coverId") REFERENCES "files"."files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."presentations" ADD CONSTRAINT "presentations_presentationId_fkey" FOREIGN KEY ("presentationId") REFERENCES "files"."files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."presentations" ADD CONSTRAINT "presentations_handoutId_fkey" FOREIGN KEY ("handoutId") REFERENCES "files"."files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."presentations" ADD CONSTRAINT "presentations_researchId_fkey" FOREIGN KEY ("researchId") REFERENCES "files"."files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
