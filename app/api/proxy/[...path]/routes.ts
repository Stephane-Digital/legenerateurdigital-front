import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "").replace(/\/$/, "");

function buildTargetUrl(pathParts: string[], search: string) {
  const path = pathParts.join("/");
  return `${BACKEND_URL}/${path}${search || ""}`;
}

async function proxyRequest(req: NextRequest, params: { path?: string[] }) {
  if (!BACKEND_URL) {
    return NextResponse.json({ detail: "API backend URL manquant" }, { status: 500 });
  }

  const targetUrl = buildTargetUrl(params.path || [], req.nextUrl.search);
  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("connection");

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  const res = await fetch(targetUrl, init);
  const body = await res.arrayBuffer();
  const responseHeaders = new Headers(res.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("transfer-encoding");

  return new NextResponse(body, {
    status: res.status,
    statusText: res.statusText,
    headers: responseHeaders,
  });
}

export async function GET(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return proxyRequest(req, await context.params);
}

export async function POST(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return proxyRequest(req, await context.params);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return proxyRequest(req, await context.params);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return proxyRequest(req, await context.params);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return proxyRequest(req, await context.params);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
