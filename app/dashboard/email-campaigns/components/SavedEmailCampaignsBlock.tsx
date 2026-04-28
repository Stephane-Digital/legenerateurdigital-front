"use client";

import { Copy, FolderOpen, RefreshCcw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import type {
  EmailCampaignFormValues,
  EmailSequenceResponse,
  SavedEmailCampaignItem,
} from "./types";
import { defaultEmailCampaignValues } from "./types";

type Props = {
  resetSignal: number;
  onOpenCampaign: (
    nextValues: EmailCampaignFormValues,
    nextSequence: EmailSequenceResponse | null,
    nextSavedCampaignId: number
  ) => void;
};

const cardClass =
  "rounded-3xl border border-yellow-400/15 bg-[#111111] p-6 shadow-[0_0_40px_rgba(250,204,21,0.04)]";

function isTokenExpired(token: string) {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return true;
    const payload = JSON.parse(atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/")));
    if (!payload?.exp) return false;
    return Date.now() >= Number(payload.exp) * 1000;
  } catch {
    return true;
  }
}

function getStoredToken() {
  if (typeof window === "undefined") return "";

  const candidates = [
    window.localStorage.getItem("access_token"),
    window.localStorage.getItem("lgd_token"),
    window.localStorage.getItem("token"),
    window.localStorage.getItem("jwt"),
  ];

  for (const candidate of candidates) {
    const token = (candidate || "").trim();
    if (token && !isTokenExpired(token)) return token;
  }

  return "";
}

function getAuthHeaders() {
  const token = getStoredToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}`, "X-LGD-Token": token };
}

function normalizeSequence(input: unknown): EmailSequenceResponse | null {
  if (!input) return null;

  let parsed = input;
  if (typeof input === "string") {
    try {
      parsed = JSON.parse(input);
    } catch {
      return null;
    }
  }

  const obj = parsed as Partial<EmailSequenceResponse>;
  if (!obj || !Array.isArray(obj.emails)) return null;

  return {
    campaign_name: String(obj.campaign_name || ""),
    campaign_type: (obj.campaign_type || "vente") as EmailSequenceResponse["campaign_type"],
    duration_days: Number(obj.duration_days || obj.emails.length || 7),
    sender_name: String(obj.sender_name || ""),
    emails: obj.emails.map((email, index) => ({
      day: Number(email.day || index + 1),
      email_type: (email.email_type || "nurture") as any,
      subject: String(email.subject || ""),
      preheader: String(email.preheader || ""),
      body: String(email.body || ""),
      cta: String(email.cta || ""),
    })),
  };
}

function buildFormValues(item: SavedEmailCampaignItem): EmailCampaignFormValues {
  return {
    ...defaultEmailCampaignValues,
    name: item.name || "",
    campaign_type: (item.campaign_type || "vente") as any,
    duration_days: (item.duration_days || 7) as 7 | 14 | 30,
    sender_name: item.sender_name || "",
    offer_name: item.offer_name || "",
    target_audience: item.target_audience || "",
    main_promise: item.main_promise || "",
    main_objective: item.main_objective || "",
    primary_cta: item.primary_cta || "",
    tone: (item.tone || "premium") as any,
    sales_intensity: (item.sales_intensity || "modere") as any,
    include_nurture: item.include_nurture ?? true,
    include_sales: item.include_sales ?? true,
    include_objection: item.include_objection ?? true,
    include_relaunch: item.include_relaunch ?? true,
    auto_cta: item.auto_cta ?? true,
    optimize_subjects: item.optimize_subjects ?? true,
    progressive_pressure: item.progressive_pressure ?? true,
  };
}

export default function SavedEmailCampaignsBlock({ resetSignal, onOpenCampaign }: Props) {
  const [items, setItems] = useState<SavedEmailCampaignItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");
      const response = await fetch(`${baseUrl}/email-campaigns/`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error("Impossible de charger les campagnes sauvegardées.");
      }

      const data = (await response.json()) as SavedEmailCampaignItem[];
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [resetSignal]);

  const openCampaign = (item: SavedEmailCampaignItem) => {
    const nextValues = buildFormValues(item);
    const nextSequence = normalizeSequence(item.generated_sequence || null);
    onOpenCampaign(nextValues, nextSequence, item.id);
  };

  const copyCampaign = async (item: SavedEmailCampaignItem) => {
    const sequence = normalizeSequence(item.generated_sequence || null);
    if (!sequence) return;

    const blob = sequence.emails
      .map(
        (email) => `Jour ${email.day}
Type: ${email.email_type}
Sujet: ${email.subject}
Préheader: ${email.preheader}

${email.body}

CTA: ${email.cta}`
      )
      .join("\n\n---------------------------\n\n");

    await navigator.clipboard.writeText(blob);
    setStatus(`Campagne "${item.name}" copiée dans le presse-papiers.`);
    window.setTimeout(() => setStatus(null), 2200);
  };

  const deleteCampaign = async (itemId: number) => {
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");
      const response = await fetch(`${baseUrl}/email-campaigns/${itemId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error("Impossible de supprimer la campagne.");
      }

      setItems((prev) => prev.filter((item) => item.id !== itemId));
      setStatus("Campagne supprimée.");
      window.setTimeout(() => setStatus(null), 2200);
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "Erreur pendant la suppression.");
    }
  };

  return (
    <div className={cardClass}>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-yellow-300">Campagnes sauvegardées</h2>
          <p className="text-sm text-zinc-400">
            Rechargez, copiez ou supprimez vos campagnes emailing déjà enregistrées dans LGD.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchCampaigns}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-2xl border border-yellow-400/20 bg-[#181818] px-4 py-2 text-sm font-medium text-yellow-100 transition hover:border-yellow-400/40 hover:text-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCcw size={15} />
          {loading ? "Actualisation..." : "Actualiser"}
        </button>
      </div>

      {status && (
        <div className="mb-4 rounded-2xl border border-yellow-400/15 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
          {status}
        </div>
      )}

      {!items.length ? (
        <div className="rounded-2xl border border-yellow-400/10 bg-[#161616] p-5 text-sm text-zinc-400">
          Aucune campagne sauvegardée pour le moment.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-yellow-400/10">
          <div className="grid grid-cols-[1.5fr_0.8fr_1fr_1.4fr] gap-3 bg-[#141414] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            <div>Campagne</div>
            <div>Durée</div>
            <div>Date</div>
            <div>Actions</div>
          </div>

          <div className="divide-y divide-yellow-400/10">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-[1.5fr_0.8fr_1fr_1.4fr] gap-3 px-4 py-4 text-sm text-zinc-200">
                <div>
                  <p className="font-medium text-yellow-100">{item.name}</p>
                  <p className="mt-1 text-xs text-zinc-500">{item.campaign_type}</p>
                </div>

                <div className="text-zinc-300">{item.duration_days} jours</div>

                <div className="text-zinc-400">
                  {item.created_at ? new Date(item.created_at).toLocaleDateString("fr-FR") : "—"}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openCampaign(item)}
                    className="inline-flex items-center gap-2 rounded-xl border border-yellow-400/20 bg-[#181818] px-3 py-2 text-xs font-medium text-yellow-100 transition hover:border-yellow-400/40 hover:text-yellow-300"
                  >
                    <FolderOpen size={14} />
                    Ouvrir
                  </button>

                  <button
                    type="button"
                    onClick={() => copyCampaign(item)}
                    className="inline-flex items-center gap-2 rounded-xl border border-yellow-400/20 bg-[#181818] px-3 py-2 text-xs font-medium text-yellow-100 transition hover:border-yellow-400/40 hover:text-yellow-300"
                  >
                    <Copy size={14} />
                    Copier
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteCampaign(item.id)}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-[#181818] px-3 py-2 text-xs font-medium text-red-300 transition hover:border-red-400/40 hover:text-red-200"
                  >
                    <Trash2 size={14} />
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
