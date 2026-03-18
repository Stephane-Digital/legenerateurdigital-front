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

  const cookie = req.headers.get("cookie") || "";

  const headers: Record<string, string> = {
    cookie,
  };

  const ct = req.headers.get("content-type");
  if (ct) headers["content-type"] = ct;

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: "no-store",
  };

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

// ✅ GET /api/automatisations/[id] -> backend /automatisations/{id}
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    return await forward(req, `/automatisations/${id}`);
  } catch (error) {
    console.error("Erreur GET /automatisations/[id] (proxy) :", error);
    return NextResponse.json({ error: "Erreur de chargement" }, { status: 500 });
  }
}

// ✅ PUT (ou PATCH) /api/automatisations/[id] -> backend /automatisations/{id}
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    return await forward(req, `/automatisations/${id}`);
  } catch (error) {
    console.error("Erreur PUT /automatisations/[id] (proxy) :", error);
    return NextResponse.json({ error: "Erreur de mise à jour" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    return await forward(req, `/automatisations/${id}`);
  } catch (error) {
    console.error("Erreur PATCH /automatisations/[id] (proxy) :", error);
    return NextResponse.json({ error: "Erreur de mise à jour" }, { status: 500 });
  }
}

// ✅ DELETE /api/automatisations/[id] -> backend /automatisations/{id}
export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    return await forward(req, `/automatisations/${id}`);
  } catch (error) {
    console.error("Erreur DELETE /automatisations/[id] (proxy) :", error);
    return NextResponse.json({ error: "Erreur de suppression" }, { status: 500 });
  }
}
