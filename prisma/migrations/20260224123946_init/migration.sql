-- CreateTable
CREATE TABLE "MainData" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MainData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExportJob" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "filters" JSONB NOT NULL,
    "lastProcessedId" INTEGER,
    "filePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExportJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MainData_category_idx" ON "MainData"("category");

-- CreateIndex
CREATE INDEX "MainData_createdAt_idx" ON "MainData"("createdAt");
