/*
  Warnings:

  - You are about to drop the column `type` on the `match_requests` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_match_requests" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fromUserId" INTEGER NOT NULL,
    "toUserId" INTEGER NOT NULL,
    "proposedTime" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "match_requests_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "match_requests_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_match_requests" ("createdAt", "fromUserId", "id", "message", "proposedTime", "status", "toUserId") SELECT "createdAt", "fromUserId", "id", "message", "proposedTime", "status", "toUserId" FROM "match_requests";
DROP TABLE "match_requests";
ALTER TABLE "new_match_requests" RENAME TO "match_requests";
CREATE INDEX "match_requests_fromUserId_idx" ON "match_requests"("fromUserId");
CREATE INDEX "match_requests_toUserId_idx" ON "match_requests"("toUserId");
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "bio" TEXT,
    "avatar" TEXT,
    "preferences" TEXT NOT NULL DEFAULT '{ "mealTimes": [], "locations": [], "foodTypes": [] }'
);
INSERT INTO "new_users" ("avatar", "bio", "department", "email", "grade", "id", "name", "password", "preferences") SELECT "avatar", "bio", "department", "email", "grade", "id", "name", "password", "preferences" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
