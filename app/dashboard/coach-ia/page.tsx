import { redirect } from "next/navigation";

// LGD — Coach IA
// ------------------------------------------------------------
// ✅ Hard server redirect to V2 (no legacy flash)
// This file MUST remain a Server Component (no "use client").
// ------------------------------------------------------------

export default function CoachRootRedirect() {
  redirect("/dashboard/coach-ia/v2");
}
