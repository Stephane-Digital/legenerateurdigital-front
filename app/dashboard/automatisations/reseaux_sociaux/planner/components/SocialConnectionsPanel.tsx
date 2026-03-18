"use client";

import { useEffect, useMemo, useState } from "react";

type NetworkKey = "instagram" | "facebook" | "pinterest";

type NetworkState = {
  connected: boolean;
  facebook_page_ready?: boolean | null;
};

type StatusResponse = {
  ok?: boolean;
  networks?: Record<string, NetworkState>;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://127.0.0.1:8000";

function getErrorMessage(data: any): string {
  if (!data) return "Erreur inconnue";
  if (typeof data === "string") return data;
  if (typeof data.detail === "string") return data.detail;
  if (typeof data.error === "string") return data.error;
  if (typeof data.message === "string") return data.message;
  return "";
}

function pickAuthUrl(data: any): string {
  if (!data) return "";
  const candidates = [
    data?.auth_url,
    data?.url,
    data?.oauth_url,
    data?.authorization_url,
    data?.login_url,
    data?.redirect_url,
    data?.data?.auth_url,
    data?.data?.url,
    data?.data?.redirect_url,
    data?.result?.auth_url,
    data?.result?.url,
    data?.result?.redirect_url,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && /^https?:\/\//i.test(candidate)) {
      return candidate;
    }
  }

  return "";
}

function getUrlOAuthParams() {
  if (typeof window === "undefined") {
    return {
      facebookConnectedFromUrl: false,
      facebookWarningFromUrl: false,
      facebookPageNameFromUrl: "",
      instagramConnectedFromUrl: false,
      instagramWarningFromUrl: false,
      instagramNameFromUrl: "",
    };
  }

  const params = new URLSearchParams(window.location.search);

  return {
    facebookConnectedFromUrl: params.get("facebook") === "connected",
    facebookWarningFromUrl: params.get("facebook") === "warning",
    facebookPageNameFromUrl: params.get("page_name") || "",
    instagramConnectedFromUrl: params.get("instagram") === "connected",
    instagramWarningFromUrl: params.get("instagram") === "warning",
    instagramNameFromUrl: params.get("ig_name") || "",
  };
}

export default function SocialConnectionsPanel() {
  const [status, setStatus] = useState<Record<string, NetworkState>>({});
  const [loading, setLoading] = useState<NetworkKey | null>(null);
  const [banner, setBanner] = useState<string>("");

  async function loadStatus() {
    const {
      facebookConnectedFromUrl,
      facebookWarningFromUrl,
      facebookPageNameFromUrl,
      instagramConnectedFromUrl,
      instagramWarningFromUrl,
      instagramNameFromUrl,
    } = getUrlOAuthParams();

    try {
      const res = await fetch(`${API_BASE}/social-connections/status`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      const data: StatusResponse = await res.json().catch(() => ({}));
      const nextStatus = { ...(data.networks || {}) };

      if (facebookConnectedFromUrl) {
        nextStatus.facebook = {
          ...(nextStatus.facebook || {}),
          connected: true,
          facebook_page_ready: true,
        };
      }

      if (instagramConnectedFromUrl) {
        nextStatus.instagram = {
          ...(nextStatus.instagram || {}),
          connected: true,
        };
      }

      setStatus(nextStatus);

      if (facebookConnectedFromUrl) {
        setBanner(
          facebookPageNameFromUrl
            ? `Facebook connecté : ${decodeURIComponent(facebookPageNameFromUrl)}`
            : "Facebook connecté."
        );
      } else if (instagramConnectedFromUrl) {
        setBanner(
          instagramNameFromUrl
            ? `Instagram connecté : @${decodeURIComponent(instagramNameFromUrl)}`
            : "Instagram connecté."
        );
      } else if (facebookWarningFromUrl) {
        setBanner("Connexion Facebook créée, mais la page n'a pas pu être validée automatiquement.");
      } else if (instagramWarningFromUrl) {
        setBanner("Connexion Instagram créée, mais aucun compte professionnel lié n'a été trouvé.");
      } else {
        setBanner("");
      }
    } catch {
      if (facebookConnectedFromUrl || instagramConnectedFromUrl) {
        setStatus((prev) => ({
          ...prev,
          ...(facebookConnectedFromUrl
            ? {
                facebook: {
                  connected: true,
                  facebook_page_ready: true,
                },
              }
            : {}),
          ...(instagramConnectedFromUrl
            ? {
                instagram: {
                  connected: true,
                },
              }
            : {}),
        }));

        if (facebookConnectedFromUrl) {
          setBanner(
            facebookPageNameFromUrl
              ? `Facebook connecté : ${decodeURIComponent(facebookPageNameFromUrl)}`
              : "Facebook connecté."
          );
        } else if (instagramConnectedFromUrl) {
          setBanner(
            instagramNameFromUrl
              ? `Instagram connecté : @${decodeURIComponent(instagramNameFromUrl)}`
              : "Instagram connecté."
          );
        }
      } else {
        setBanner("Impossible de charger le statut des connexions.");
      }
    }
  }

  useEffect(() => {
    loadStatus();

    const onFocus = () => {
      loadStatus();
    };

    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const cards = useMemo(
    () => [
      {
        key: "instagram" as const,
        title: "Instagram",
        description: "Connexion requise pour publier automatiquement sur Instagram.",
        soon: false,
      },
      {
        key: "facebook" as const,
        title: "Facebook",
        description: "Connexion requise pour publier automatiquement sur Facebook.",
        soon: false,
      },
      {
        key: "pinterest" as const,
        title: "Pinterest",
        description: "Connexion à venir. (stub / bientôt)",
        soon: true,
      },
    ],
    []
  );

  async function handleConnect(network: NetworkKey) {
    setBanner("");

    if (network === "pinterest") {
      setBanner("Pinterest n'est pas encore branché.");
      return;
    }

    setLoading(network);
    try {
      const res = await fetch(`${API_BASE}/social-connections/${network}/connect`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setBanner(getErrorMessage(data) || `Erreur backend (${res.status})`);
        return;
      }

      const authUrl = pickAuthUrl(data);
      if (!authUrl) {
        const fallback = typeof data === "object" ? JSON.stringify(data).slice(0, 500) : "";
        setBanner(
          getErrorMessage(data) ||
            `URL OAuth manquante (backend). Réponse reçue: ${fallback || "aucune donnée exploitable"}`
        );
        return;
      }

      if (typeof window !== "undefined") {
        window.location.assign(authUrl);
        return;
      }
    } catch {
      setBanner("Impossible de démarrer la connexion OAuth.");
    } finally {
      setLoading(null);
    }
  }

  async function handleDisconnect(network: NetworkKey) {
    setBanner("");
    setLoading(network);

    try {
      const res = await fetch(`${API_BASE}/social-connections/disconnect/${network}`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setBanner(getErrorMessage(data) || `Déconnexion impossible (${res.status})`);
        return;
      }

      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("facebook");
        url.searchParams.delete("page_id");
        url.searchParams.delete("page_name");
        url.searchParams.delete("instagram");
        url.searchParams.delete("ig_id");
        url.searchParams.delete("ig_name");
        url.searchParams.delete("ts");
        window.history.replaceState({}, "", url.toString());
      }

      setStatus((prev) => ({
        ...prev,
        [network]: {
          connected: false,
          facebook_page_ready: false,
        },
      }));

      await loadStatus();
    } catch {
      setBanner("Impossible de déconnecter ce réseau.");
    } finally {
      setLoading(null);
    }
  }

  function badgeFor(network: NetworkKey) {
    const s = status[network];

    if (!s?.connected) {
      return {
        text: "Non connecté",
        cls: "bg-[#101215] text-gray-200 border border-white/10",
      };
    }

    if (network === "facebook" && !s.facebook_page_ready) {
      return {
        text: "Connecté (page à valider)",
        cls: "bg-yellow-500/10 text-yellow-300 border border-yellow-500/20",
      };
    }

    return {
      text: "Connecté",
      cls: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
    };
  }

  return (
    <section className="rounded-[24px] border border-yellow-500/20 bg-black/50 shadow-[0_0_40px_rgba(234,179,8,0.08)] px-5 md:px-8 py-6 md:py-7">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-yellow-400 font-semibold text-xl">Branchement Réseaux sociaux</h2>
          <p className="text-sm text-gray-300 mt-1">
            Connecte tes comptes pour publier automatiquement (Instagram / Facebook / Pinterest).
          </p>
        </div>
        <p className="text-xs text-gray-500 text-right">Statut en temps réel (backend)</p>
      </div>

      {banner ? (
        <div className="mb-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">
          {banner}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cards.map((card) => {
          const badge = badgeFor(card.key);
          const isConnected = !!status[card.key]?.connected;
          const disabled = loading === card.key;

          return (
            <div
              key={card.key}
              className="rounded-[22px] border border-yellow-500/20 bg-[#0c0c0d] px-5 py-6 shadow-[0_0_20px_rgba(234,179,8,0.05)]"
            >
              <div className="flex items-center justify-between gap-3 mb-5">
                <h3 className="text-yellow-300 font-semibold text-2xl leading-none">{card.title}</h3>

                {card.soon ? (
                  <button
                    type="button"
                    onClick={() => handleConnect(card.key)}
                    className="rounded-xl bg-yellow-400 px-6 py-3 text-black font-semibold hover:bg-yellow-300 transition"
                  >
                    Connecter
                  </button>
                ) : isConnected ? (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleDisconnect(card.key)}
                    className="rounded-xl border border-yellow-500/40 px-6 py-3 text-yellow-300 font-semibold hover:bg-yellow-500/10 transition disabled:opacity-60"
                  >
                    {disabled ? "..." : "Déconnecter"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleConnect(card.key)}
                    className="rounded-xl bg-yellow-400 px-6 py-3 text-black font-semibold hover:bg-yellow-300 transition disabled:opacity-60"
                  >
                    {disabled ? "..." : "Connecter"}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 mb-5">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${badge.cls}`}>
                  {badge.text}
                </span>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed">{card.description}</p>

              {card.key === "facebook" && isConnected && !status.facebook?.facebook_page_ready ? (
                <p className="mt-3 text-xs text-yellow-400">
                  Le compte est connecté, mais la page Facebook n’est pas encore prête côté backend.
                </p>
              ) : null}

              {card.soon ? <p className="mt-3 text-xs text-gray-500">(Mode dev / stub possible)</p> : null}
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-gray-500">
        Note dev : si tu vois une page Meta “Application inactive”, vérifie que le compte utilisé est bien admin,
        développeur ou testeur de l’app en mode dev, puis relance “Connecter”.
      </p>
    </section>
  );
}
