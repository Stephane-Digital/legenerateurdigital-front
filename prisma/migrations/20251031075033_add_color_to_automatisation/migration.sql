-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Automatisation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "color" TEXT NOT NULL DEFAULT 'green',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Automatisation" ("createdAt", "description", "id", "name", "status") SELECT "createdAt", "description", "id", "name", "status" FROM "Automatisation";
DROP TABLE "Automatisation";
ALTER TABLE "new_Automatisation" RENAME TO "Automatisation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
