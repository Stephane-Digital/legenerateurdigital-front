import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET campagne
export async function GET(req: Request, { params }: any) {
  try {
    const res = await fetch(`${API_URL}/campaigns/${params.id}`, {
      credentials: "include",
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    console.error("GET /campaigns/:id error:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// UPDATE campagne
export async function PUT(req: Request, { params }: any) {
  try {
    const body = await req.json();

    const res = await fetch(`${API_URL}/campaigns/${params.id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return NextResponse.json(await res.json());
  } catch (e) {
    console.error("PUT /campaigns/:id error:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE campagne
export async function DELETE(req: Request, { params }: any) {
  try {
    const res = await fetch(`${API_URL}/campaigns/${params.id}`, {
      method: "DELETE",
      credentials: "include",
    });

    return NextResponse.json(await res.json());
  } catch (e) {
    console.error("DELETE /campaigns/:id error:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
