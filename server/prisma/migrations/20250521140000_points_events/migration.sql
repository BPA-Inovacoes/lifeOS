-- CreateEnum
CREATE TYPE "PointsEventSource" AS ENUM ('TASK', 'HABIT');

-- CreateTable
CREATE TABLE "PointsEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "rowId" TEXT NOT NULL,
    "source" "PointsEventSource" NOT NULL,
    "date" DATE NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PointsEvent_userId_date_idx" ON "PointsEvent"("userId", "date");

-- CreateIndex
CREATE INDEX "PointsEvent_workspaceId_date_idx" ON "PointsEvent"("workspaceId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "PointsEvent_rowId_date_key" ON "PointsEvent"("rowId", "date");

-- AddForeignKey
ALTER TABLE "PointsEvent" ADD CONSTRAINT "PointsEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointsEvent" ADD CONSTRAINT "PointsEvent_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "DatabaseRow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
