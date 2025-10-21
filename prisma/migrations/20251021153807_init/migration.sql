-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL DEFAULT 'temporary_placeholder',
    "bio" TEXT,
    "avatar" TEXT,
    "preferences" TEXT NOT NULL DEFAULT '{ "mealTimes": [], "locations": [], "foodTypes": [] }'
);
INSERT INTO "new_users" ("avatar", "bio", "department", "email", "grade", "id", "name", "preferences") SELECT "avatar", "bio", "department", "email", "grade", "id", "name", "preferences" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
