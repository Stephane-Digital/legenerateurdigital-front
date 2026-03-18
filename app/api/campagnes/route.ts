import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET – liste des campagnes
export async function GET() {
  try {
    const res = await fetch(`${API_URL}/campaigns`, {
      credentials: "include",
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    console.error("GET /campaigns error:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST – création campagne
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const res = await fetch(`${API_URL}/campaigns`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    console.error("POST /campaigns error:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
