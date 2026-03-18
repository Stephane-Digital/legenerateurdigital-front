import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const backend = process.env.NEXT_PUBLIC_API_URL + "/carousels/upload";

    const res = await fetch(backend, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
