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

async function readCoachProfileContext() {
  try {
    const token = getToken();

    const response = await fetch(`${API_URL}/coach-profile`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    return data?.profile?.coach_v2?.context || {};
  } catch {
    return {};
  }
}

export async function requestCMODispatch(params: {
  objective: string;
  blocker: string;
  targetModule: CMOTarget;
}) {
  const token = getToken();
  const coach = await readCoachProfileContext();

  const response = await fetch(`${API_URL}/cmo-ai/dispatch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: JSON.stringify({
      objective: params.objective,
      blocker: params.blocker || coach?.mainBlocker || "",
      target_module: params.targetModule,

      offer: coach?.offerDescription || "",
      audience: coach?.targetAudienceDescription || "",
      preferred_channel: coach?.primaryChannel || "",

      current_situation: [
        coach?.businessGoal ? `Objectif business : ${coach.businessGoal}` : "",
        coach?.businessModel ? `Modèle business : ${coach.businessModel}` : "",
        coach?.audienceSize ? `Taille audience : ${coach.audienceSize}` : "",
        coach?.level ? `Niveau : ${coach.level}` : "",
        coach?.timePerDay ? `Temps disponible : ${coach.timePerDay} minutes/jour` : "",
        coach?.channelNotes ? `Notes canal : ${coach.channelNotes}` : "",
      ]
        .filter(Boolean)
        .join("\n"),

      constraints: [
        coach?.mainBlocker ? `Blocage principal : ${coach.mainBlocker}` : "",
        "Utiliser en priorité la description de l'offre, la description du client idéal et le canal principal issus du profil Coach Alex.",
        "Ne jamais citer LGD, Le Générateur Digital, MRR ou l'affiliation LGD sauf si ces éléments sont explicitement présents dans l'offre, la cible ou l'objectif utilisateur.",
      ]
        .filter(Boolean)
        .join("\n"),

      tone: "premium, humain, direct",
      user_level: coach?.level || "intermediate",
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = typeof data?.detail === "string" ? data.detail : "CMO Dispatch indisponible.";
    throw new Error(message);
  }

  return data?.result || data;
}
