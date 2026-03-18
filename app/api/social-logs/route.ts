import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function proxyToBackend(req: NextRequest, path: string) {
  const token = req.cookies.get("lgd_token")?.value;

  const backendUrl = `${BACKEND_URL}${path}`;

  const init: RequestInit = {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    // Pour GET, pas de body
    body: req.method === "GET" ? undefined : await req.text(),
  };

  const resp = await fetch(backendUrl, init);

  const data = await resp.text();

  return new NextResponse(data, {
    status: resp.status,
    headers: {
      "Content-Type": resp.headers.get("Content-Type") || "application/json",
    },
  });
}

// GET /api/social-logs  ->  GET /social-logs
export async function GET(req: NextRequest) {
  return proxyToBackend(req, "/social-logs");
}

// POST/PUT/DELETE si besoin plus tard
export async function POST(req: NextRequest) {
  return proxyToBackend(req, "/social-logs");
}
