import { NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/fileStore";

const DATA_PATH = "data/formations.json";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const items: any[] = await readJSON(DATA_PATH);
    const updated = items.filter((i) => i.id !== Number(params.id));
    await writeJSON(DATA_PATH, updated);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur de suppression" }, { status: 500 });
  }
}
