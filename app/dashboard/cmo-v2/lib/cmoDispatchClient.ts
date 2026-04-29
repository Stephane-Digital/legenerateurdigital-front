import type { CMOTarget } from "../types";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://legenerateurdigital-backend-m9b5.onrender.com").replace(/\/$/, "");

function getToken() {
  if (typeof window === "undefined") return "";
  return (
    window.localStorage.getItem("access_token") ||
    window.localStorage.getItem("lgd_token") ||
    window.localStorage.getItem("token") ||
    window.localStorage.getItem("jwt") ||
    ""
  );
}

export async function requestCMODispatch(params: {
  objective: string;
  blocker: string;
  targetModule: CMOTarget;
}) {
  const token = getToken();
  const response = await fetch(`${API_URL}/cmo-ai/dispatch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      objective: params.objective,
      blocker: params.blocker,
      target_module: params.targetModule,
      tone: "premium, humain, direct",
      user_level: "intermediate",
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = typeof data?.detail === "string" ? data.detail : "CMO Dispatch indisponible.";
    throw new Error(message);
  }

  return data?.result || data;
}
