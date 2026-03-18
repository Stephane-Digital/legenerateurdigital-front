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

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const items = await loadAll();
  const found = items.find((x) => String(x.id) === String(id));
  if (!found) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(found);
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const payload = await req.json().catch(() => ({}));

  const items = await loadAll();
  const idx = items.findIndex((x) => String(x.id) === String(id));
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const now = new Date().toISOString();
  items[idx] = {
    ...items[idx],
    ...payload,
    id: String(id),
    updatedAt: now,
  };

  await saveAll(items);
  return NextResponse.json(items[idx]);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const items = await loadAll();
  const next = items.filter((x) => String(x.id) !== String(id));
  if (next.length === items.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await saveAll(next);
  return NextResponse.json({ ok: true });
}
