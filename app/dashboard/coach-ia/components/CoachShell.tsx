import { redirect } from "next/navigation";

// LGD — LEGACY COACH SHELL (V1)
// ------------------------------------------------------------
// 🚫 Deprecated. This component is intentionally neutralized.
// If anything still imports CoachShell by mistake, we hard-redirect
// to the V2 route so the V1 UI can never render.
// ------------------------------------------------------------

export default function CoachShell() {
  redirect("/dashboard/coach-ia/v2");
}
