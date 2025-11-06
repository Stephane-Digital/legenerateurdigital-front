import { NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/fileStore";

const DATA_PATH = "data/formations.json";

export async function GET() {
  const items = await readJSON(DATA_PATH);
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items: any[] = await readJSON(DATA_PATH);

    const newItem = {
      id: Date.now(),
      name: body.name || `Nouvelle formation ${items.length + 1}`,
      status: body.status || "Active"
    };

    const updated = [...items, newItem];
    await writeJSON(DATA_PATH, updated);

    return NextResponse.json(newItem);
  } catch {
    return NextResponse.json({ error: "Erreur d’ajout" }, { status: 500 });
  }
}

