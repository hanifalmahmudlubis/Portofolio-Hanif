-- CreateTable
CREATE TABLE "ExperienceImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "experienceId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExperienceImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContactMessage_isRead_idx" ON "ContactMessage"("isRead");

-- CreateIndex
CREATE INDEX "Project_published_idx" ON "Project"("published");

-- CreateIndex
CREATE INDEX "Project_category_idx" ON "Project"("category");

-- CreateIndex
CREATE INDEX "ProjectImage_projectId_idx" ON "ProjectImage"("projectId");

-- AddForeignKey
ALTER TABLE "ExperienceImage" ADD CONSTRAINT "ExperienceImage_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experience"("id") ON DELETE CASCADE ON UPDATE CASCADE;
