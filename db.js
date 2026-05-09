import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = process.env.DOTENV_CONFIG_PATH
	? path.resolve(__dirname, process.env.DOTENV_CONFIG_PATH)
	: path.resolve(
			__dirname,
			process.env.NODE_ENV === "test" ? ".env.test" : ".env"
		);

dotenv.config({ path: envPath });

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export default { prisma };