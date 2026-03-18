"use client";

import { Copy, Mail, Pencil, RotateCcw, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { EmailCampaignFormValues, EmailSequenceItem, EmailSequenceResponse } from "./types";

type Props = {
  formValues: EmailCampaignFormValues;
  sequence: EmailSequenceResponse | null;
  onSaved: (savedId: number) => void;
  onReset: () => void;
};

const cardClass =
  "rounded-3xl border border-yellow-400/15 bg-[#111111] p-6 shadow-[0_0_40px_rgba(250,204,21,0.04)]";
const inputClass =
  "w-full rounded-2xl border border-yellow-400/10 bg-[#181818] px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-400/40 focus:ring-1 focus:ring-yellow-400/30";

function badgeClass(emailType: string) {
  if (emailType === "vente") return "bg-emerald-500/15 text-emerald-300 border-emerald-400/20";
  if (emailType === "objection") return "bg-sky-500/15 text-sky-300 border-sky-400/20";
  if (emailType === "relance") return "bg-rose-500/15 text-rose-300 border-rose-400/20";
  return "bg-yellow-500/15 text-yellow-300 border-yellow-400/20";
}

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

function parseErrorMessage(response: Response, fallback: string) {
  return response
    .json()
    .then((data) => data?.detail || data?.message || fallback)
    .catch(() => fallback);
}

function getAuthHeaders() {
  if (typeof window === "undefined") return {};
  const token = window.localStorage.getItem("lgd_token");
  if (!token || isTokenExpired(token)) return {};
  return { Authorization: `Bearer ${token}`, "X-LGD-Token": token };
}

export default function EmailSequenceViewer({ formValues, sequence, onSaved, onReset }: Props) {
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState<EmailSequenceItem[]>([]);

  const safeSequence = useMemo(() => {
    if (!sequence) return null;
    const emails = (sequence.emails || []).map((email, index) => ({ ...email, day: index + 1 }));
    return { ...sequence, emails };
  }, [sequence]);

  useEffect(() => {
    setEditing(safeSequence?.emails || []);
    setSavedMessage(null);
  }, [safeSequence]);

  const senderDisplay = formValues.sender_name?.trim() || "Non renseigné";

  const copySequence = async () => {
    if (!safeSequence) return;

    const blob = editing
      .map(
        (email) => `Jour ${email.day}
Type: ${email.email_type}
Sujet: ${email.subject}
Préheader: ${email.preheader}

${email.body}

CTA: ${email.cta}

Expéditeur: ${senderDisplay}`
      )
      .join("\n\n---------------------------\n\n");

    await navigator.clipboard.writeText(blob);
    setCopiedMessage("Enregistré dans le presse papier");
    window.setTimeout(() => setCopiedMessage(null), 2400);
  };

  const updateEmail = (index: number, key: keyof EmailSequenceItem, value: string | number) => {
    setEditing((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  };

  const saveCampaign = async () => {
    if (!safeSequence) return;
    setSaving(true);
    setSavedMessage(null);

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");
      const response = await fetch(`${baseUrl}/email-campaigns/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          ...formValues,
          generated_sequence: {
            ...safeSequence,
            sender_name: formValues.sender_name,
            emails: editing.map((email, index) => ({ ...email, day: index + 1 })),
          },
        }),
      });

      if (!response.ok) {
        const detail = await parseErrorMessage(response, "Impossible de sauvegarder la campagne.");
        throw new Error(detail);
      }

      const data = await response.json();
      onSaved(data.id);
      setSavedMessage(`Campagne #${data.id} sauvegardée avec succès.`);
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Erreur inconnue pendant la sauvegarde.";
      setSavedMessage(message);
    } finally {
      setSaving(false);
    }
  };

  if (!safeSequence) {
    return (
      <div className={`${cardClass} flex min-h-[420px] items-center justify-center`}>
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-300">
            <Mail size={22} />
          </div>
          <h2 className="text-xl font-semibold text-yellow-300">Séquence générée</h2>
          <p className="mt-3 text-sm leading-7 text-zinc-400">
            L’aperçu des emails générés apparaîtra ici après la génération IA.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClass}>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-yellow-300">Séquence générée</h2>
          <p className="text-sm text-zinc-400">
            {safeSequence.campaign_name} • {safeSequence.campaign_type} • {safeSequence.duration_days} jours • {editing.length} emails
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-zinc-500">
            Expéditeur : {senderDisplay}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={copySequence} className="inline-flex items-center gap-2 rounded-2xl border border-yellow-400/20 bg-[#181818] px-4 py-2 text-sm font-medium text-yellow-100 transition hover:border-yellow-400/40 hover:text-yellow-300">
            <Copy size={15} /> Copier
          </button>
          <button type="button" onClick={saveCampaign} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-500 via-yellow-400 to-amber-300 px-4 py-2 text-sm font-semibold text-black transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60">
            <Save size={15} /> {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
          <button type="button" onClick={onReset} className="inline-flex items-center gap-2 rounded-2xl border border-yellow-400/20 bg-[#181818] px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-yellow-400/40 hover:text-yellow-300">
            <RotateCcw size={15} /> Régénérer
          </button>
        </div>
      </div>

      {copiedMessage && <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{copiedMessage}</div>}
      {savedMessage && <div className="mb-4 rounded-2xl border border-yellow-400/15 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">{savedMessage}</div>}

      <div className="max-h-[760px] space-y-4 overflow-y-auto pr-2">
        {editing.map((email, index) => (
          <article key={`${index}-${email.subject}`} className="rounded-2xl border border-yellow-400/10 bg-[#161616] p-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-yellow-400/20 bg-yellow-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300">
                Jour {index + 1}
              </span>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${badgeClass(email.email_type)}`}>
                {email.email_type}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-yellow-400/15 bg-[#121212] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                <Pencil size={12} /> édition directe
              </span>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-yellow-400/10 bg-[#141414] p-4">
                <p className="mb-2 text-xs uppercase tracking-[0.18em] text-zinc-500">Sujet</p>
                <input className={inputClass} value={email.subject} onChange={(e) => updateEmail(index, "subject", e.target.value)} />
              </div>

              <div className="rounded-2xl border border-yellow-400/10 bg-[#141414] p-4">
                <p className="mb-2 text-xs uppercase tracking-[0.18em] text-zinc-500">Préheader</p>
                <input className={inputClass} value={email.preheader} onChange={(e) => updateEmail(index, "preheader", e.target.value)} />
              </div>

              <div className="rounded-2xl border border-yellow-400/10 bg-[#141414] p-4">
                <p className="mb-2 text-xs uppercase tracking-[0.18em] text-zinc-500">Corps de l’email</p>
                <textarea className={`${inputClass} min-h-[260px] whitespace-pre-wrap leading-7`} value={email.body} onChange={(e) => updateEmail(index, "body", e.target.value)} />
              </div>

              <div className="rounded-2xl border border-yellow-400/10 bg-[#141414] p-4">
                <p className="mb-2 text-xs uppercase tracking-[0.18em] text-zinc-500">CTA</p>
                <input className={inputClass} value={email.cta} onChange={(e) => updateEmail(index, "cta", e.target.value)} />
              </div>

              <div className="rounded-2xl border border-yellow-400/10 bg-[#141414] p-4">
                <p className="mb-2 text-xs uppercase tracking-[0.18em] text-zinc-500">Signature / Expéditeur</p>
                <div className="rounded-2xl border border-yellow-400/10 bg-[#181818] px-4 py-3 text-sm text-zinc-300">
                  {senderDisplay}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}