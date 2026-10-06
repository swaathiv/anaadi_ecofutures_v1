import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Minimal persistent store: one JSON file, written atomically, with all
 * writes serialised in-process.
 *
 * Suitable for local development and a single long-running Node server with
 * a persistent disk. It is NOT suitable for serverless or multi-instance
 * hosting; replace this module with a database (e.g. Postgres) behind the
 * same functions before deploying there. See README → "Data storage".
 */

import type { Order, Session, User } from "@/lib/types";

export type * from "@/lib/types";

interface Data {
  users: User[];
  sessions: Session[];
  orders: Order[];
}

const dataDir = path.resolve(/*turbopackIgnore: true*/ process.env.DATA_DIR || ".data");
const file = path.join(dataDir, "db.json");

let cache: Data | null = null;
let queue: Promise<unknown> = Promise.resolve();

async function load(): Promise<Data> {
  if (cache) return cache;
  try {
    cache = JSON.parse(await readFile(file, "utf8")) as Data;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    cache = { users: [], sessions: [], orders: [] };
  }
  return cache;
}

async function persist(data: Data) {
  await mkdir(dataDir, { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(data, null, 2), { mode: 0o600 });
  await rename(tmp, file);
}

/** Read-only snapshot. Callers must not mutate the result. */
export async function read<T>(fn: (data: Readonly<Data>) => T): Promise<T> {
  await queue;
  return fn(await load());
}

/** Serialised read-modify-write. */
export function write<T>(fn: (data: Data) => T): Promise<T> {
  const run = queue.then(async () => {
    const data = await load();
    const draft = structuredClone(data);
    const result = fn(draft);
    await persist(draft);
    cache = draft;
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}
