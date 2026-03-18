import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true });

  // On supprime le cookie
  res.headers.append(
    "Set-Cookie",
    "lgd_token=deleted; Path=/; Max-Age=0; HttpOnly; SameSite=Lax;"
  );

  return res;
}
