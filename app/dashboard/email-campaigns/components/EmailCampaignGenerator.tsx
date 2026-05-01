"use client";

import { FilePlus2, Loader2, RefreshCcw, Sparkles } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";

import type { EmailCampaignFormValues, EmailSequenceResponse } from "./types";

type Props = {
  values: EmailCampaignFormValues;
  setValues: Dispatch<SetStateAction<EmailCampaignFormValues>>;
  onGenerated: (sequence: EmailSequenceResponse) => void;
  onResetGenerator: () => void;
  onCreateNewCampaign: () => void;
};

const cardClass =
  "rounded-3xl border border-yellow-400/15 bg-[#111111] p-6 shadow-[0_0_40px_rgba(250,204,21,0.04)]";
const labelClass = "mb-2 block text-sm font-medium text-yellow-200";
const inputClass =
  "w-full rounded-2xl border border-yellow-400/10 bg-[#181818] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-yellow-400/40 focus:ring-1 focus:ring-yellow-400/30";

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

function cleanGeneratedText(value: unknown) {
  return String(value ?? "")
    .replace(/\*\*/g, "")
    .replace(/\bCTA\s*:/gi, "")
    .replace(/\bCORPS\s*:/gi, "")
    .replace(/VERSION COURTE[\s\S]*?(?=VERSION LONGUE|NOTE LGD|$)/gi, "")
    .replace(/VERSION LONGUE[\s\S]*?(?=NOTE LGD|$)/gi, "")
    .replace(/Cet email vise[\s\S]*?(?=\n{2,}|$)/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildHumanEmailBody(values: EmailCampaignFormValues, day: number) {
  const offer = cleanGeneratedText(values.offer_name || "Le Générateur Digital");
  const target = cleanGeneratedText(values.target_audience || "les entrepreneurs, freelances, coachs et créateurs qui veulent développer leur business en ligne");
  const promise = cleanGeneratedText(values.main_promise || "avancer avec un plan clair, créer du contenu utile et transformer tes idées en actions marketing concrètes");
  const cta = cleanGeneratedText(values.primary_cta || "Passer à l’action maintenant");

  const openings = [
    "Je vais être honnête avec toi.",
    "On va aller à l’essentiel.",
    "Je veux te partager quelque chose de simple.",
    "La plupart des personnes ne bloquent pas par manque d’idées.",
    "Il y a un point que beaucoup sous-estiment.",
    "Avant de continuer, prends juste une seconde.",
    "Dernier rappel, mais sans pression inutile.",
  ];

  const angles = [
    "La plupart des entrepreneurs qui stagnent en ligne ne manquent pas de motivation. Ils manquent surtout d’un système clair pour transformer leurs idées en contenus, leurs contenus en prospects, puis leurs prospects en ventes.",
    "Le problème n’est pas d’avoir trop peu d’outils. Le problème, c’est de passer trop de temps à jongler entre les outils au lieu de construire une vraie machine marketing.",
    "Quand tout est dispersé entre les idées, les posts, les emails, les pages et les offres, même un bon projet peut rester invisible.",
    "Ce qui change vraiment, ce n’est pas d’ajouter un outil de plus. C’est d’avoir un chemin simple pour savoir quoi créer, quoi envoyer et quoi vendre.",
    "Le plus important n’est pas de tout maîtriser. Le plus important, c’est de reprendre une direction claire pour ton business en ligne.",
    "Tu peux rester dans le flou encore quelques semaines, ou reprendre une méthode simple aujourd’hui pour avancer sans t’éparpiller.",
    "Si ton projet compte vraiment, tu n’as pas besoin de perfection. Tu as besoin d’un prochain pas clair, d’un message plus fort, et d’un système qui travaille avec toi.",
  ];

  return `Bonjour [Prénom],

${openings[Math.min(day - 1, openings.length - 1)]}

${angles[Math.min(day - 1, angles.length - 1)]}

🎁 Ce que je te propose

Avec ${offer}, l’objectif est simple :
• clarifier ton message
• créer du contenu plus utile
• structurer ton marketing digital
• transformer tes idées en actions concrètes
• laisser l’IA faire le plus gros du travail sans perdre ton côté humain

💡 Ce qui change vraiment

${promise}

Pour ${target}, le vrai sujet n’est pas de publier plus.

Le vrai sujet, c’est de construire un système simple qui t’aide à avancer, à capter l’attention et à convertir avec plus de clarté.

👉 ${cta}

Si tu veux, tu peux aussi répondre à cet email et me dire ce qui bloque aujourd’hui dans ton marketing.
Je lis tous les messages.

À bientôt peut-être 👀

Alex IA 🤖
Ton Coach LGD`;
}

function humanizeSequence(sequence: EmailSequenceResponse, values: EmailCampaignFormValues): EmailSequenceResponse {
  return {
    ...sequence,
    emails: (sequence.emails || []).map((email, index) => ({
      ...email,
      day: index + 1,
      subject: cleanGeneratedText(email.subject || `Jour ${index + 1} — avancer simplement`),
      preheader: cleanGeneratedText(email.preheader || "Un message simple pour avancer dans ton business en ligne."),
      body: buildHumanEmailBody(values, index + 1),
      cta: cleanGeneratedText(values.primary_cta || email.cta || "Passer à l’action maintenant"),
    })),
  };
}

async function parseErrorMessage(response: Response, fallback: string) {
  try {
    const data = await response.json();
    if (typeof data?.detail === "string") return data.detail;
    if (typeof data?.message === "string") return data.message;
    if (data?.detail) return JSON.stringify(data.detail);
  } catch {
    // ignore
  }
  return fallback;
}

export default function EmailCampaignGenerator({
  values,
  setValues,
  onGenerated,
  onResetGenerator,
  onCreateNewCampaign,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof EmailCampaignFormValues>(
    key: K,
    value: EmailCampaignFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    if (!values.sender_name || values.sender_name.trim() === "") {
      setError("Veuillez remplir le champ Nom de l'expéditeur");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(
        /\/+$/,
        ""
      );

      const response = await fetch(`${baseUrl}/email-campaigns/generate`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const detail = await parseErrorMessage(response, "Impossible de générer la séquence IA.");
        throw new Error(detail);
      }

      const data = (await response.json()) as EmailSequenceResponse;
      onGenerated(humanizeSequence(data, values));
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "La génération a échoué. Vérifie le backend puis réessaie.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${cardClass} h-full`}>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-300">
          <Sparkles size={20} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-yellow-300">Générateur IA</h2>
          <p className="text-sm text-zinc-400">
            Paramètre la campagne puis génère une séquence email premium.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div>
          <label className={labelClass}>Nom de la campagne</label>
          <input
            className={inputClass}
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Ex. Lancement Offre Signature"
          />
        </div>

        <div>
          <label className={labelClass}>Type de campagne</label>
          <select
            className={inputClass}
            value={values.campaign_type}
            onChange={(e) =>
              update("campaign_type", e.target.value as EmailCampaignFormValues["campaign_type"])
            }
          >
            <option value="vente">Vente</option>
            <option value="nurturing">Nurturing</option>
            <option value="lancement">Lancement</option>
            <option value="relance">Relance</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Durée</label>
          <select
            className={inputClass}
            value={values.duration_days}
            onChange={(e) => update("duration_days", Number(e.target.value) as 7 | 14 | 30)}
          >
            <option value={7}>7 jours</option>
            <option value={14}>14 jours</option>
            <option value={30}>30 jours</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Nom de l’expéditeur</label>
          <input
            className={inputClass}
            value={values.sender_name}
            onChange={(e) => update("sender_name", e.target.value)}
            placeholder="Indiquer le nom de l'expéditeur"
          />
        </div>

        <div>
          <label className={labelClass}>Offre / Produit</label>
          <input
            className={inputClass}
            value={values.offer_name}
            onChange={(e) => update("offer_name", e.target.value)}
            placeholder="Ex. Programme LGD Email Mastery"
          />
        </div>

        <div className="xl:col-span-2">
          <label className={labelClass}>Cible / Audience</label>
          <textarea
            className={`${inputClass} min-h-[88px]`}
            value={values.target_audience}
            onChange={(e) => update("target_audience", e.target.value)}
            placeholder="Qui est ciblé par cette séquence ?"
          />
        </div>

        <div className="xl:col-span-2">
          <label className={labelClass}>Promesse principale</label>
          <textarea
            className={`${inputClass} min-h-[88px]`}
            value={values.main_promise}
            onChange={(e) => update("main_promise", e.target.value)}
            placeholder="Transformation ou bénéfice principal."
          />
        </div>

        <div className="xl:col-span-2">
          <label className={labelClass}>Objectif principal</label>
          <textarea
            className={`${inputClass} min-h-[88px]`}
            value={values.main_objective}
            onChange={(e) => update("main_objective", e.target.value)}
            placeholder="Ex. Obtenir des réponses, prendre un call, vendre une offre..."
          />
        </div>

        <div className="xl:col-span-2">
          <label className={labelClass}>CTA principal</label>
          <textarea
            className={`${inputClass} min-h-[88px]`}
            value={values.primary_cta}
            onChange={(e) => update("primary_cta", e.target.value)}
            placeholder="Ex. Cliquez ici pour réserver votre audit stratégique."
          />
        </div>

        <div>
          <label className={labelClass}>Ton</label>
          <select
            className={inputClass}
            value={values.tone}
            onChange={(e) => update("tone", e.target.value as EmailCampaignFormValues["tone"])}
          >
            <option value="premium">Premium</option>
            <option value="direct">Direct</option>
            <option value="storytelling">Storytelling</option>
            <option value="pedagogique">Pédagogique</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Intensité commerciale</label>
          <select
            className={inputClass}
            value={values.sales_intensity}
            onChange={(e) =>
              update("sales_intensity", e.target.value as EmailCampaignFormValues["sales_intensity"])
            }
          >
            <option value="doux">Doux</option>
            <option value="modere">Modéré</option>
            <option value="fort">Fort</option>
          </select>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-yellow-400/10 bg-[#161616] p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-yellow-300">
            Types d’emails
          </h3>
          <div className="space-y-3 text-sm text-zinc-300">
            {[
              ["include_nurture", "Inclure nurture"],
              ["include_sales", "Inclure vente"],
              ["include_objection", "Inclure objection"],
              ["include_relaunch", "Inclure relance"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={values[key as keyof EmailCampaignFormValues] as boolean}
                  onChange={(e) =>
                    update(key as keyof EmailCampaignFormValues, e.target.checked as never)
                  }
                  className="h-4 w-4 rounded border-yellow-500/40 bg-transparent text-yellow-400"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-yellow-400/10 bg-[#161616] p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-yellow-300">
            Optimisations IA
          </h3>
          <div className="space-y-3 text-sm text-zinc-300">
            {[
              ["auto_cta", "CTA automatique"],
              ["optimize_subjects", "Sujets optimisés conversion"],
              ["progressive_pressure", "Pression commerciale progressive"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={values[key as keyof EmailCampaignFormValues] as boolean}
                  onChange={(e) =>
                    update(key as keyof EmailCampaignFormValues, e.target.checked as never)
                  }
                  className="h-4 w-4 rounded border-yellow-500/40 bg-transparent text-yellow-400"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-500 via-yellow-400 to-amber-300 px-5 py-3 text-sm font-semibold text-black transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          {loading ? "Génération en cours..." : "Générer la séquence IA"}
        </button>

        <button
          type="button"
          onClick={onCreateNewCampaign}
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-yellow-400/20 bg-[#181818] px-5 py-3 text-sm font-semibold text-yellow-100 transition hover:border-yellow-400/40 hover:text-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FilePlus2 size={18} />
          Créer une nouvelle campagne
        </button>

        <button
          type="button"
          onClick={onResetGenerator}
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-yellow-400/20 bg-[#181818] px-5 py-3 text-sm font-semibold text-yellow-100 transition hover:border-yellow-400/40 hover:text-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCcw size={18} />
          Réinitialiser le générateur IA
        </button>
      </div>
    </div>
  );
}
