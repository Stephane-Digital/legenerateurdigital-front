import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("http://localhost:8000/auth/me", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      return NextResponse.json(
        { detail: "Non authentifié" },
        { status: 401 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { detail: "Erreur interne serveur" },
      { status: 500 }
    );
  }
}
