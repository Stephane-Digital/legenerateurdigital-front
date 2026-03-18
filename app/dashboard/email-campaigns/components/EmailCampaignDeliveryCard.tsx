"use client";

import { ExternalLink, Send, Server, ShieldCheck } from "lucide-react";
import { useState } from "react";

import type { SystemeIoPreparePayload } from "./types";

type Props = {
  savedCampaignId: number | null;
};

const cardClass =
  "rounded-3xl border border-yellow-400/15 bg-[#111111] p-6 shadow-[0_0_40px_rgba(250,204,21,0.04)]";
const inputClass =
  "w-full rounded-2xl border border-yellow-400/10 bg-[#181818] px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-400/40 focus:ring-1 focus:ring-yellow-400/30";
const SYSTEME_IO_AFFILIATE_URL =
  process.env.NEXT_PUBLIC_SYSTEME_IO_AFFILIATE_URL ||
  "https://systeme.io/?sa=sa0197731656f2e6f1c5c435a0f1dd73840b7fc8b";

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

function getAuthHeaders() {
  if (typeof window === "undefined") return {};
  const token = window.localStorage.getItem("lgd_token");
  if (!token || isTokenExpired(token)) return {};
  return { Authorization: `Bearer ${token}`, "X-LGD-Token": token };
}

export default function EmailCampaignDeliveryCard({ savedCampaignId }: Props) {
  const [form, setForm] = useState<SystemeIoPreparePayload>({
    systeme_tag: "",
    systeme_campaign_name: "",
    mode: "ready",
  });
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [payloadPreview, setPayloadPreview] = useState<string>("");

  const preparePayload = async () => {
    if (!savedCampaignId) return;

    setLoading(true);
    setStatus(null);

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");
      const response = await fetch(`${baseUrl}/email-campaigns/${savedCampaignId}/prepare-systeme-io`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || "Préparation Systeme.io impossible.");
      }

      const data = await response.json();
      setPayloadPreview(JSON.stringify(data.payload, null, 2));
      setStatus(`Campagne prête pour Systeme.io (${data.delivery_status}).`);
    } catch (err) {
      console.error(err);
      setStatus(err instanceof Error ? err.message : "Erreur pendant la préparation Systeme.io.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cardClass}>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-300">
            <Server size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-yellow-300">Diffusion Systeme.io</h2>
            <p className="text-sm text-zinc-400">Prépare le payload de diffusion sans casser le workflow LGD.</p>
          </div>
        </div>

        <a
          href={SYSTEME_IO_AFFILIATE_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-2xl border border-yellow-400/20 bg-[#181818] px-4 py-3 text-sm font-medium text-yellow-100 transition hover:border-yellow-400/40 hover:text-yellow-300"
        >
          <ExternalLink size={16} /> Créer un compte Systeme.io gratuitement
        </a>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-yellow-200">Tag / segment</label>
          <input className={inputClass} value={form.systeme_tag} onChange={(e) => setForm((prev) => ({ ...prev, systeme_tag: e.target.value }))} placeholder="Ex. leads-chauds" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-yellow-200">Nom campagne Systeme.io</label>
          <input className={inputClass} value={form.systeme_campaign_name} onChange={(e) => setForm((prev) => ({ ...prev, systeme_campaign_name: e.target.value }))} placeholder="Ex. LGD 7 jours Code Liberté" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-yellow-200">Mode</label>
          <select className={inputClass} value={form.mode} onChange={(e) => setForm((prev) => ({ ...prev, mode: e.target.value as SystemeIoPreparePayload["mode"] }))}>
            <option value="ready">Production</option>
            <option value="draft">Brouillon</option>
            <option value="payload">Payload only</option>
          </select>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-2xl border border-yellow-400/15 bg-[#181818] px-4 py-2 text-sm text-zinc-300">
          <ShieldCheck size={16} className="text-yellow-300" />
          {savedCampaignId ? `Campagne #${savedCampaignId} sauvegardée` : "Sauvegarde requise avant diffusion"}
        </div>

        <button
          type="button"
          disabled={!savedCampaignId || loading}
          onClick={preparePayload}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-500 via-yellow-400 to-amber-300 px-5 py-3 text-sm font-semibold text-black transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send size={16} />
          {loading ? "Préparation..." : "Préparer pour Systeme.io"}
        </button>
      </div>

      {status && (
        <div className="mt-4 rounded-2xl border border-yellow-400/15 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
          {status}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-yellow-400/10 bg-[#161616] p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Payload préparé</p>
        <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap text-xs leading-6 text-zinc-300">
          {payloadPreview || "Le payload Systeme.io apparaîtra ici après préparation."}
        </pre>
      </div>

      <div className="mt-4 rounded-2xl border border-yellow-400/10 bg-[#161616] p-4 text-sm leading-7 text-zinc-400">
        <p className="font-medium text-yellow-200">Roadmap déjà prévue</p>
        <p>Étape suivante : tag → contacts → workflow → webhook. Le planner email sera dédié pour éviter toute pollution du planner social Post/Carrousel.</p>
      </div>
    </div>
  );
}