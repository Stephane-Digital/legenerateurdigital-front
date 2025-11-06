-- CreateTable
CREATE TABLE "BusinessPlan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "title" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "aiContent" TEXT,
    "pdfUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BusinessPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_IdeeEntreprise" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "marche" TEXT NOT NULL,
    "promesse" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IdeeEntreprise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_IdeeEntreprise" ("createdAt", "description", "id", "marche", "promesse", "titre", "userId") SELECT "createdAt", "description", "id", "marche", "promesse", "titre", "userId" FROM "IdeeEntreprise";
DROP TABLE "IdeeEntreprise";
ALTER TABLE "new_IdeeEntreprise" RENAME TO "IdeeEntreprise";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
