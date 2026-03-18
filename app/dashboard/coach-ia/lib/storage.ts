/* LGD Coach IA — local storage helpers (client-only) */
export type StoredProfile = any;

const K_PROFILE = "lgd_coach_profile_v1";
const K_OBJECTIVE = "lgd_coach_objective_v1";

export function getStoredProfile(): StoredProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(K_PROFILE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredProfile(v: StoredProfile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(K_PROFILE, JSON.stringify(v));
}

export function getStoredObjective(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(K_OBJECTIVE);
}

export function setStoredObjective(v: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(K_OBJECTIVE, v || "");
}
