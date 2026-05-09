import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = process.env.DOTENV_CONFIG_PATH
  ? path.resolve(__dirname, process.env.DOTENV_CONFIG_PATH)
  : path.resolve(
      __dirname,
      process.env.NODE_ENV === "test" ? ".env.test" : ".env"
    );

dotenv.config({ path: envPath });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL || "",
  },
});