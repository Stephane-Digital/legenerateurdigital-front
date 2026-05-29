import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_BASE =
  (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "https://legenerateurdigital-backend-m9b5.onrender.com").replace(/\/$/, "");

function buildTargetUrl(req: NextRequest, pathParts: string[]) {
  const path = `/${(pathParts || []).join("/")}`;
  const url = new URL(req.url);
  const target = new URL(`${BACKEND_BASE}${path}`);
  target.search = url.search;
  return target.toString();
}

async function proxy(req: NextRequest, ctx: { params: Promise<{ path?: string[] }> | { path?: string[] } }) {
  const params = await ctx.params;
  const pathParts = params?.path || [];
  const targetUrl = buildTargetUrl(req, pathParts);

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("connection");

  const hasBody = !["GET", "HEAD"].includes(req.method.toUpperCase());

  const response = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: hasBody ? await req.arrayBuffer() : undefined,
    redirect: "manual",
    cache: "no-store",
  });

  const outHeaders = new Headers(response.headers);
  outHeaders.delete("content-encoding");
  outHeaders.delete("transfer-encoding");

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: outHeaders,
  });
}

export async function GET(req: NextRequest, ctx: any) {
  return proxy(req, ctx);
}

export async function POST(req: NextRequest, ctx: any) {
  return proxy(req, ctx);
}

export async function PUT(req: NextRequest, ctx: any) {
  return proxy(req, ctx);
}

export async function PATCH(req: NextRequest, ctx: any) {
  return proxy(req, ctx);
}

export async function DELETE(req: NextRequest, ctx: any) {
  return proxy(req, ctx);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
