"use client";

export type CoachProfile = {
  user_id: number;
  intent?: string | null;
  level?: string | null;
  time_per_day?: number | null;
  profile: Record<string, any>;
};

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
}

function getAuthHeaders() {
  if (typeof window === "undefined") return {};
  const token =
    window.localStorage.getItem("access_token") ||
    window.localStorage.getItem("token") ||
    window.localStorage.getItem("jwt") ||
    "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseErr(res: Response) {
  let detail = "";
  try {
    const j = await res.json();
    detail = j?.detail || j?.message || "";
  } catch {
    // ignore
  }
  return detail || `HTTP ${res.status}`;
}

export async function getCoachProfile(): Promise<CoachProfile> {
  const base = apiBase();
  if (!base) throw new Error("NEXT_PUBLIC_API_URL manquant");

  const res = await fetch(`${base}/coach-profile`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
    },
    credentials: "include",
  });

  if (!res.ok) throw new Error(await parseErr(res));
  return (await res.json()) as CoachProfile;
}

export async function patchCoachProfile(patch: {
  profile?: Record<string, any>;
  intent?: string;
  level?: string;
  time_per_day?: number;
}): Promise<CoachProfile> {
  const base = apiBase();
  if (!base) throw new Error("NEXT_PUBLIC_API_URL manquant");

  const res = await fetch(`${base}/coach-profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(patch || {}),
  });

  if (!res.ok) throw new Error(await parseErr(res));
  return (await res.json()) as CoachProfile;
}

export async function replaceCoachProfile(payload: {
  profile: Record<string, any>;
  intent?: string;
  level?: string;
  time_per_day?: number;
}): Promise<CoachProfile> {
  const base = apiBase();
  if (!base) throw new Error("NEXT_PUBLIC_API_URL manquant");

  const res = await fetch(`${base}/coach-profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(payload || {}),
  });

  if (!res.ok) throw new Error(await parseErr(res));
  return (await res.json()) as CoachProfile;
}
