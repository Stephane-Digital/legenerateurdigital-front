import "dotenv/config"; // ✅ charge automatiquement ton .env
import { defineConfig, env } from "@prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    path: "./prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"), // lit la variable DATABASE_URL de ton .env
  },
});
