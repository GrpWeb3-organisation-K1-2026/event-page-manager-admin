import path from "node:path";
import { defineConfig } from "prisma/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config({ path: path.resolve(__dirname, ".env") });

const DATABASE_URL = process.env.DATABASE_URL!;

export default defineConfig({
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: DATABASE_URL,
  },
  migrate: {
    async adapter() {
      const pool = new Pool({ connectionString: DATABASE_URL });
      return new PrismaPg(pool);
    },
  },
});