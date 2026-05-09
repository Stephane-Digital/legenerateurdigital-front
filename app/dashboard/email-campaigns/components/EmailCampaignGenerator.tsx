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
    .replace(/^\s*👉\s*.+$/gim, "")
    .replace(/\n*À\s+bientôt(?:\s+peut-être)?[\s\S]*$/gi, "")
    .replace(/\n*À\s+très\s+vite[\s\S]*$/gi, "")
    .replace(/\n*Alex IA\s*🤖?[\s\S]*$/gi, "")
    .replace(/\n*Ton Coach LGD[\s\S]*$/gi, "")
    .replace(/\n*LGD\s*$/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function humanizeSequence(sequence: EmailSequenceResponse, values: EmailCampaignFormValues): EmailSequenceResponse {
  void values;

  return {
    ...sequence,
    emails: (sequence.emails || [])
      .map((email, index) => ({
        ...email,
        day: index + 1,
        subject: cleanGeneratedText(email.subject || `Jour ${index + 1} — avancer simplement`),
        preheader: cleanGeneratedText(email.preheader || ""),
        body: cleanGeneratedText(email.body),
        cta: cleanGeneratedText(email.cta || ""),
      }))
      .filter((email) => email.body.trim().length > 0),
  };
}


function looksLikeLocalFallback(sequence: EmailSequenceResponse) {
  const joined = (sequence.emails || [])
    .map((email) => `${email.subject || ""}\n${email.body || ""}`)
    .join("\n")
    .toLowerCase();

  return (
    joined.includes("tu as peut-être déjà vécu ce moment étrange") ||
    joined.includes("l’erreur la plus fréquente, ce n’est pas de ne rien faire") ||
    joined.includes("la solution n’est pas de créer plus") ||
    joined.includes("tu peux continuer à apprendre") ||
    joined.includes("à bientôt peut-être") ||
    joined.includes("alex ia") ||
    joined.includes("ton coach lgd")
  );
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
    const generationStarted = Date.now();

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
      const cleanedSequence = humanizeSequence(data, values);

      if (!cleanedSequence.emails || cleanedSequence.emails.length < 1) {
        throw new Error("Le moteur IA n’a pas retourné d’emails exploitables. Vérifie la clé OpenAI / les logs Render.");
      }

      if (looksLikeLocalFallback(cleanedSequence)) {
        throw new Error("Ancien fallback détecté : ces emails ne viennent pas de l’IA live. Vérifie le déploiement backend Render puis relance.");
      }

      const elapsed = Date.now() - generationStarted;
      if (elapsed < 3200) {
        await new Promise((resolve) => window.setTimeout(resolve, 3200 - elapsed));
      }

      onGenerated(cleanedSequence);
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
            onChange={(e) => update("duration_days", Number(e.target.value) as 5 | 7)}
          >
            <option value={5}>5 jours</option>
            <option value={7}>7 jours</option>
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
