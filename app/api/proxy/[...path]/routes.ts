import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ path?: string[] }> | { path?: string[] };
};

function backendBase() {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    process.env.BACKEND_URL ||
    "https://legenerateurdigital-backend-m9b5.onrender.com"
  ).replace(/\/$/, "");
}

function copyHeaders(req: NextRequest) {
  const headers = new Headers();
  const auth = req.headers.get("authorization");
  const cookie = req.headers.get("cookie");
  const contentType = req.headers.get("content-type");

  if (auth) headers.set("authorization", auth);
  if (cookie) headers.set("cookie", cookie);
  if (contentType) headers.set("content-type", contentType);
  headers.set("accept", req.headers.get("accept") || "application/json");

  return headers;
}

async function proxy(req: NextRequest, context: RouteContext) {
  const params = await context.params;
  const path = (params?.path || []).join("/");
  const search = req.nextUrl.search || "";
  const target = `${backendBase()}/${path}${search}`;

  const init: RequestInit = {
    method: req.method,
    headers: copyHeaders(req),
    cache: "no-store",
    redirect: "manual",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
  }

  const res = await fetch(target, init);
  const body = await res.arrayBuffer();
  const headers = new Headers(res.headers);

  headers.set("access-control-allow-origin", req.headers.get("origin") || "*");
  headers.set("access-control-allow-credentials", "true");

  return new NextResponse(body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
}

export async function GET(req: NextRequest, context: RouteContext) {
  return proxy(req, context);
}

export async function POST(req: NextRequest, context: RouteContext) {
  return proxy(req, context);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  return proxy(req, context);
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  return proxy(req, context);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  return proxy(req, context);
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": req.headers.get("origin") || "*",
      "access-control-allow-credentials": "true",
      "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "access-control-allow-headers": "content-type,authorization",
    },
  });
}
