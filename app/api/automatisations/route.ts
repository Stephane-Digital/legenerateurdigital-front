import { NextRequest, NextResponse } from "next/server";

function getApiBase() {
  const base =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    "http://127.0.0.1:8000";
  return base.replace(/\/$/, "");
}

function buildUrl(path: string, req?: NextRequest) {
  const base = getApiBase();
  const qs = req ? req.nextUrl.searchParams.toString() : "";
  if (qs) return `${base}${path}?${qs}`;
  return `${base}${path}`;
}

async function forward(req: NextRequest, path: string) {
  const url = buildUrl(path, req);

  // ✅ forward cookies (auth backend)
  const cookie = req.headers.get("cookie") || "";

  const headers: Record<string, string> = {
    cookie,
  };

  // On copie le content-type si présent
  const ct = req.headers.get("content-type");
  if (ct) headers["content-type"] = ct;

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: "no-store",
  };

  // body uniquement si nécessaire
  if (req.method !== "GET" && req.method !== "HEAD") {
    const bodyText = await req.text();
    init.body = bodyText || "";
  }

  const res = await fetch(url, init);
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  }

  const text = await res.text().catch(() => "");
  return new NextResponse(text, {
    status: res.status,
    headers: { "content-type": contentType || "text/plain" },
  });
}

// ✅ Récupérer toutes les automatisations
export async function GET(req: NextRequest) {
  try {
    return await forward(req, "/automatisations");
  } catch (error) {
    console.error("Erreur GET /automatisations (proxy) :", error);
    return NextResponse.json({ error: "Erreur de chargement" }, { status: 500 });
  }
}

// ✅ Créer une nouvelle automatisation
export async function POST(req: NextRequest) {
  try {
    return await forward(req, "/automatisations");
  } catch (error) {
    console.error("Erreur POST /automatisations (proxy) :", error);
    return NextResponse.json({ error: "Erreur de création" }, { status: 500 });
  }
}

// ✅ Mettre à jour une automatisation (status, etc.)
export async function PATCH(req: NextRequest) {
  try {
    // On ne change pas le contrat : on forward tel quel le body (ex: {id,status})
    return await forward(req, "/automatisations");
  } catch (error) {
    console.error("Erreur PATCH /automatisations (proxy) :", error);
    return NextResponse.json({ error: "Erreur de mise à jour" }, { status: 500 });
  }
}

// ✅ Supprimer une automatisation
export async function DELETE(req: NextRequest) {
  try {
    // On forward tel quel le body (ex: {id})
    return await forward(req, "/automatisations");
  } catch (error) {
    console.error("Erreur DELETE /automatisations (proxy) :", error);
    return NextResponse.json({ error: "Erreur de suppression" }, { status: 500 });
  }
}
