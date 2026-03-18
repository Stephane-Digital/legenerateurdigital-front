import { NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/fileStore";

type Formation = {
  id: string;
  title?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
};

const STORE_PATH = "data/formations.json";

async function loadAll(): Promise<Formation[]> {
  return readJSON<Formation[]>(STORE_PATH, []);
}

async function saveAll(items: Formation[]) {
  await writeJSON(STORE_PATH, items);
}

export async function GET() {
  const items = await loadAll();
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const payload = await req.json().catch(() => ({}));
  const items = await loadAll();

  const now = new Date().toISOString();
  const id = payload?.id ? String(payload.id) : String(Date.now());

  const newItem: Formation = {
    ...payload,
    id,
    createdAt: payload?.createdAt ?? now,
    updatedAt: now,
  };

  items.unshift(newItem);
  await saveAll(items);

  return NextResponse.json(newItem, { status: 201 });
}
