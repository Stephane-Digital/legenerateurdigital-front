"use client";

import { Copy, Download, Mail, Pencil, RotateCcw, Save } from "lucide-react";
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

function buildPlainSequence(emails: EmailSequenceItem[], senderDisplay: string) {
  return emails
    .map(
      (email) => `Jour ${email.day}\nType: ${email.email_type}\nSujet: ${email.subject}\nPréheader: ${email.preheader}\n\n${email.body}\n\nCTA: ${email.cta}\n\nExpéditeur: ${senderDisplay}`
    )
    .join("\n\n---------------------------\n\n");
}

function buildSystemeIoSequence(emails: EmailSequenceItem[], senderDisplay: string) {
  return emails
    .map((email) => {
      const subjectA = email.subject || "Votre sujet principal";
      const subjectB = "Et si tout changeait aujourd’hui ?";
      const subjectC = "Ce que personne ne vous dit vraiment";

      const ctaA = email.cta || "Découvrir maintenant";
      const ctaB = "Voir comment ça fonctionne";
      const ctaC = "Accéder à la méthode";

      const body = String(email.body || "").trim();
      const firstParagraph =
        body
          .split(/\n{2,}|\n/)
          .map((part) => part.trim())
          .find(Boolean) || body || "Voici le message principal à transmettre.";

      return `==================================================
EMAIL JOUR ${email.day} — ${String(email.email_type || "email").toUpperCase()}
==================================================

🧪 OBJETS À TESTER DANS SYSTEME.IO

A → ${subjectA}
B → ${subjectB}
C → ${subjectC}

--------------------------------------------------

PRÉHEADER :
${email.preheader || "Un message utile pour donner envie d’ouvrir l’email."}

--------------------------------------------------

VERSION COURTE — MOBILE / RAPIDE
--------------------------------------------------

Bonjour [Prénom],

${firstParagraph}

👉 CTA :
${ctaA}

À très vite,
${senderDisplay}

--------------------------------------------------

VERSION LONGUE — STORYTELLING / CONVERSION
--------------------------------------------------

Bonjour [Prénom],

${body}

👉 CTA À TESTER :

A → ${ctaA}
B → ${ctaB}
C → ${ctaC}

À très vite,
${senderDisplay}

--------------------------------------------------
NOTE LGD :
- Copie l’objet A, B ou C dans le champ “Objet” de Systeme.io.
- Copie le préheader dans le champ prévu si disponible.
- Colle uniquement la version courte OU la version longue dans le corps de l’email.
- Remplace [Prénom] par la variable Systeme.io si tu l’utilises.
`;
    })
    .join("\n\n==================================================\n\n");
}

function buildSingleSystemeIoEmail(email: EmailSequenceItem, senderDisplay: string) {
  return buildSystemeIoSequence([email], senderDisplay);
}

function formatPersistentLinks(rawLinks: string) {
  const links = rawLinks
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!links.length) return "";

  return `

━━━━━━━━━━━━━━━━━━━━

🔗 Liens utiles :

${links.map((link) => `• ${link}`).join("\n")}`;
}

function buildCleanSystemeIoEmail(
  email: EmailSequenceItem,
  senderDisplay: string,
  persistentLinks: string
) {
  let rawBody = String(email.body || "").trim();

// 🔥 Nettoyage automatique signature IA
rawBody = rawBody
  .replace(/à très vite[,!\s]*lgd/gi, "")
  .replace(/à bientôt[,!\s]*lgd/gi, "")
  .replace(/lgd$/gi, "")
  .trim();
  const cta = String(email.cta || "Découvrir maintenant").trim();

  const paragraphs = rawBody
    .split(/\n{2,}|(?<=[.!?])\s+(?=[A-ZÀ-ÖØ-Ý])/)
    .map((part) => part.trim())
    .filter(Boolean);

  const intro = paragraphs.slice(0, 2).join("\n\n");
  const middle = paragraphs.slice(2, -1).join("\n\n");
  const end = paragraphs.length > 2 ? paragraphs[paragraphs.length - 1] : "";
  const usefulLinks = formatPersistentLinks(persistentLinks);

  return `Bonjour [Prénom],

J’espère que tu vas bien ✨

${intro || rawBody}

${middle ? `━━━━━━━━━━━━━━━━━━━━

${middle}` : ""}

${end ? `━━━━━━━━━━━━━━━━━━━━

${end}` : ""}

👉 Clique ici pour passer à l’action :
${cta}${usefulLinks}

À très vite,

${senderDisplay}`;
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function EmailSequenceViewer({ formValues, sequence, onSaved, onReset }: Props) {
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState<EmailSequenceItem[]>([]);
  const [persistentLinks, setPersistentLinks] = useState("");

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

    await navigator.clipboard.writeText(buildPlainSequence(editing, senderDisplay));
    setCopiedMessage("Séquence copiée dans le presse-papiers.");
    window.setTimeout(() => setCopiedMessage(null), 2400);
  };

  const copySystemeIoSequence = async () => {
    if (!safeSequence) return;

    await navigator.clipboard.writeText(buildSystemeIoSequence(editing, senderDisplay));
    setCopiedMessage("Séquence complète SIO PRO copiée.");
    window.setTimeout(() => setCopiedMessage(null), 2400);
  };

  const copySingleSystemeIoEmail = async (email: EmailSequenceItem, index: number) => {
    await navigator.clipboard.writeText(
      buildCleanSystemeIoEmail({ ...email, day: index + 1 }, senderDisplay, persistentLinks)
    );
    setCopiedMessage(`Email jour ${index + 1} copié en version SIO CLEAN aérée et prête à envoyer.`);
    window.setTimeout(() => setCopiedMessage(null), 2400);
  };

  const exportSequenceTxt = () => {
    if (!safeSequence) return;

    const safeName = (safeSequence.campaign_name || "campagne-emailing-lgd")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    downloadTextFile(`${safeName || "campagne-emailing-lgd"}.txt`, buildSystemeIoSequence(editing, senderDisplay));
    setCopiedMessage("Fichier texte exporté.");
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
          <button type="button" onClick={copySystemeIoSequence} className="inline-flex items-center gap-2 rounded-2xl border border-yellow-400/20 bg-[#181818] px-4 py-2 text-sm font-medium text-yellow-100 transition hover:border-yellow-400/40 hover:text-yellow-300">
            <Copy size={15} /> Copier plan SIO complet
          </button>
          <button type="button" onClick={exportSequenceTxt} className="inline-flex items-center gap-2 rounded-2xl border border-yellow-400/20 bg-[#181818] px-4 py-2 text-sm font-medium text-yellow-100 transition hover:border-yellow-400/40 hover:text-yellow-300">
            <Download size={15} /> Export .txt
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

      <div className="mb-5 rounded-2xl border border-yellow-400/15 bg-[#141414] p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300">
              Liens persistants
            </p>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              Ajoute un ou plusieurs liens, un par ligne. Ils seront injectés automatiquement dans chaque email copié avec “Copier SIO CLEAN”.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPersistentLinks("")}
            className="self-start rounded-full border border-yellow-400/20 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:border-yellow-400/40 hover:text-yellow-300 md:self-auto"
          >
            Effacer les liens
          </button>
        </div>

        <textarea
          className={`${inputClass} mt-3 min-h-[92px]`}
          value={persistentLinks}
          onChange={(event) => setPersistentLinks(event.target.value)}
          placeholder={"Exemples :\nPage de vente : https://...\nCalendrier : https://...\nBonus : https://..."}
        />
      </div>

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

              <button
                type="button"
                onClick={() => copySingleSystemeIoEmail(email, index)}
                className="ml-auto inline-flex items-center gap-2 rounded-full border border-yellow-400/25 bg-yellow-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-yellow-200 transition hover:border-yellow-400/50 hover:bg-yellow-400/15 hover:text-yellow-300"
              >
                <Copy size={12} /> Copier SIO CLEAN
              </button>
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
