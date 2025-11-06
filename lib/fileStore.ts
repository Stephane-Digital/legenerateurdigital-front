// /lib/fileStore.ts
import fs from "fs/promises";
import path from "path";

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [k: string]: JSONValue };

export async function readJSON(relPath: string) {
  const filePath = path.join(process.cwd(), relPath);
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function writeJSON(relPath: string, data: JSONValue) {
  const filePath = path.join(process.cwd(), relPath);
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

