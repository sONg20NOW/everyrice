-- CreateTable
CREATE TABLE "TimeSlot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subject" TEXT NOT NULL,
    "location" TEXT,
    "professor" TEXT,
    "day" INTEGER NOT NULL,
    "startTime" REAL NOT NULL,
    "endTime" REAL NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "TimeSlot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "bio" TEXT,
    "avatar" TEXT,
    "preferences" TEXT NOT NULL DEFAULT '{ "mealTimes": [], "locations": [], "foodTypes": [] }'
);

-- CreateTable
CREATE TABLE "match_requests" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fromUserId" INTEGER NOT NULL,
    "toUserId" INTEGER NOT NULL,
    "proposedTime" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    CONSTRAINT "match_requests_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "match_requests_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "match_results" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "commonFreeTime" TEXT NOT NULL,
    "matchScore" REAL NOT NULL,
    CONSTRAINT "match_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TimeSlot_userId_idx" ON "TimeSlot"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "match_requests_fromUserId_idx" ON "match_requests"("fromUserId");

-- CreateIndex
CREATE INDEX "match_requests_toUserId_idx" ON "match_requests"("toUserId");

-- CreateIndex
CREATE INDEX "match_results_userId_idx" ON "match_results"("userId");
