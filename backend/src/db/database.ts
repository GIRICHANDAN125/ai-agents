import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import fs from "fs";
import { NexusDBSchema, defaultData } from "./schema";
import { logger } from "../services/logger.service";

const dbPath = process.env.DB_PATH || "./data/nexus.db.json";
const resolvedPath = path.resolve(process.cwd(), dbPath);

fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });

const adapter = new JSONFile<NexusDBSchema>(resolvedPath);
const db = new Low<NexusDBSchema>(adapter, defaultData);

let initialized = false;

export async function initDatabase(): Promise<Low<NexusDBSchema>> {
  if (!initialized) {
    await db.read();
    db.data ||= structuredClone(defaultData);
    await db.write();
    initialized = true;
    logger.info(`Database initialized at ${resolvedPath}`);
  }
  return db;
}

export function getDb(): Low<NexusDBSchema> {
  if (!initialized) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
}
