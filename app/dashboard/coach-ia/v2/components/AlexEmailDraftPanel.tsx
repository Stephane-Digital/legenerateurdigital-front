"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { AlexContext } from "../lib/types";
import { createAlexEmailDraft } from "../lib/emailDraftApi";
import {
  ALEX_EMAIL_DRAFT_FORM_FIELDS,
  prepareAlexEmailDraft,
  validateAlexEmailDraft,
  type AlexEmailDraft,
  type AlexEmailDraftProject,
} from "../lib/emailDraftBuilder";

type Props = { context: AlexContext; project: AlexEmailDraftProject | null };
type EditableTextKey = "name" | "sender_name" | "offer_name" | "target_audience" | "main_promise" | "main_objective" | "primary_cta";
type EditableBoolKey = "include_nurture" | "include_sales" | "include_objection" | "include_relaunch" | "auto_cta" | "optimize_subjects" | "progressive_pressure";

const TEXT_FIELDS: Array<{ key: EditableTextKey; label: string; textarea?: boolean }> = [
  { key: "name", label: "Nom de campagne" },
  { key: "sender_name", label: "Nom réel de l'expéditeur (à confirmer)" },
  { key: "offer_name", label: "Offre / Produit" },
  { key: "target_audience", label: "Cible / Audience", textarea: true },
  { key: "main_promise", label: "Promesse principale", textarea: true },
  { key: "main_objective", label: "Objectif principal", textarea: true },
  { key: "primary_cta", label: "Appel à l'action (CTA)", textarea: true },
];
const BOOL_FIELDS: Array<{ key: EditableBoolKey; label: string }> = [
  { key: "include_nurture", label: "Inclure des emails pédagogiques" },
  { key: "include_sales", label: "Inclure des emails de vente" },
  { key: "include_objection", label: "Traiter les objections" },
  { key: "include_relaunch", label: "Prévoir une relance" },
  { key: "auto_cta", label: "Optimisation du CTA" },
  { key: "optimize_subjects", label: "Optimiser les objets" },
  { key: "progressive_pressure", label: "Progression de l'intensité commerciale" },
];

function apiBase() {
  const configured = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  return (configured || "http://127.0.0.1:8000").replace(/\/+$/, "");
}
function getAuthToken(): string {
  if (typeof window === "undefined") return "";
  for (const key of ["access_token", "lgd_token", "token", "jwt"]) {
    const token = window.localStorage.getItem(key)?.trim();
    if (token) return token;
  }
  return "";
}

export default function AlexEmailDraftPanel({ context, project }: Props) {
  const router = useRouter();
  const prepared = useMemo(() => prepareAlexEmailDraft(context, project), [context, project]);
  const [values, setValues] = useState<AlexEmailDraft>(prepared);
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const savingRef = useRef(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState<number | null>(null);

  // La source est le profil Alex ; recharger les champs tant que le brouillon n'est pas créé.
  useEffect(() => {
    if (savedId === null && !dirty) setValues(prepared);
  }, [prepared, savedId, dirty]);

  const missing = validateAlexEmailDraft(values);
  const update = <K extends keyof AlexEmailDraft>(key: K, value: AlexEmailDraft[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
    setError("");
  };

  async function createDraft() {
    if (savingRef.current || busy || savedId !== null) return;
    const invalid = validateAlexEmailDraft(values);
    if (invalid.length) {
      setExpanded(true);
      setError(`Complète ou vérifie d'abord : ${invalid.join(", ")}.`);
      return;
    }
    savingRef.current = true;
    setBusy(true);
    setError("");
    try {
      const id = await createAlexEmailDraft(values, {
        apiBase: apiBase(),
        token: getAuthToken(),
      });
      setSavedId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de création du brouillon.");
    } finally {
      savingRef.current = false;
      setBusy(false);
    }
  }

  const fieldClass = "mt-1 w-full rounded-xl border border-yellow-500/20 bg-black/35 p-3 text-sm text-white outline-none focus:border-yellow-400/70";
  return (
    <section className="mb-6 w-full rounded-3xl border border-yellow-500/25 bg-[#0b0f16] p-4 sm:p-5" aria-label="Brouillon Emailing préparé par Coach Alex">
      <div className="text-xs font-black uppercase tracking-[0.16em] text-yellow-300/80">S2.B · Alex prépare ton Emailing IA</div>
      <h2 className="mt-2 text-lg font-semibold text-yellow-100">Ta campagne est déjà préparée</h2>
      <p className="mt-2 text-sm leading-6 text-white/75">
        Alex reprend ton projet Business pour préparer les {ALEX_EMAIL_DRAFT_FORM_FIELDS.length} paramètres de l'Emailing IA.
        Aucun email n'est généré ni envoyé à cette étape : tu vérifies puis tu décides de sauvegarder le brouillon.
      </p>
      <div className="mt-3 grid gap-2 text-sm text-white/75 sm:grid-cols-2">
        <p><span className="text-yellow-200">Offre :</span> {values.offer_name || "À définir"}</p>
        <p><span className="text-yellow-200">Audience :</span> {values.target_audience || "À définir"}</p>
        <p><span className="text-yellow-200">Durée :</span> {values.duration_days} jours</p>
        <p><span className="text-yellow-200">Statut :</span> {savedId !== null ? `Brouillon enregistré (#${savedId})` : "Préparation — non enregistrée"}</p>
      </div>
      {savedId !== null ? (
        <div className="mt-4 space-y-3 rounded-2xl border border-green-500/30 bg-green-500/5 p-4">
          <p role="status" className="text-sm text-green-200">Brouillon #{savedId} enregistré dans ton espace Emailing IA. Aucun email envoyé.</p>
          <button type="button" onClick={() => router.push("/dashboard/email-campaigns")}
            className="rounded-xl bg-yellow-400 px-4 py-3 text-sm font-bold text-black hover:bg-yellow-300">
            Ouvrir Emailing IA et retrouver mon brouillon
          </button>
          <p className="text-xs text-white/60">Dans « Campagnes enregistrées », choisis « Ouvrir » sur « {values.name} » pour charger tous les paramètres et lancer la génération si tu le souhaites.</p>
        </div>
      ) : (
        <>
          <button type="button" aria-expanded={expanded} onClick={() => setExpanded((v) => !v)}
            className="mt-4 rounded-xl border border-yellow-500/35 px-4 py-2 text-sm font-semibold text-yellow-200 hover:bg-yellow-500/10">
            {expanded ? "Masquer les 18 paramètres" : "Vérifier / ajuster les 18 paramètres"}
          </button>
          {expanded && (
            <div className="mt-4 space-y-4 rounded-2xl border border-yellow-500/20 bg-black/15 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {TEXT_FIELDS.map(({ key, label, textarea }) => (
                  <label key={key} className={textarea ? "sm:col-span-2" : ""}>
                    <span className="text-xs font-semibold text-yellow-100">{label}</span>
                    {textarea ? (
                      <textarea rows={2} value={values[key]} onChange={(e) => update(key, e.target.value)} className={fieldClass}/>
                    ) : (
                      <input value={values[key]} onChange={(e) => update(key, e.target.value)} className={fieldClass}/>
                    )}
                  </label>
                ))}
                <label><span className="text-xs text-yellow-100">Type de campagne</span>
                  <select value={values.campaign_type} className={fieldClass} onChange={(e) => update("campaign_type", e.target.value as AlexEmailDraft["campaign_type"])}>
                    <option value="vente">Vente</option><option value="nurturing">Nurturing</option><option value="lancement">Lancement</option><option value="relance">Relance</option>
                  </select>
                </label>
                <label><span className="text-xs text-yellow-100">Durée</span>
                  <select value={values.duration_days} className={fieldClass} onChange={(e) => update("duration_days", Number(e.target.value) as 5|7)}>
                    <option value={5}>5 jours</option><option value={7}>7 jours</option>
                  </select>
                </label>
                <label><span className="text-xs text-yellow-100">Ton</span>
                  <select value={values.tone} className={fieldClass} onChange={(e) => update("tone", e.target.value as AlexEmailDraft["tone"])}>
                    <option value="premium">Premium</option><option value="direct">Direct</option><option value="storytelling">Storytelling</option><option value="pedagogique">Pédagogique</option>
                  </select>
                </label>
                <label><span className="text-xs text-yellow-100">Intensité commerciale</span>
                  <select value={values.sales_intensity} className={fieldClass} onChange={(e) => update("sales_intensity", e.target.value as AlexEmailDraft["sales_intensity"])}>
                    <option value="doux">Doux</option><option value="modere">Modéré</option><option value="fort">Fort</option>
                  </select>
                </label>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {BOOL_FIELDS.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 text-sm text-white/80">
                    <input type="checkbox" checked={values[key]} onChange={(e) => update(key, e.target.checked)} />{label}
                  </label>
                ))}
              </div>
            </div>
          )}
          {missing.length > 0 && (
            <p className="mt-3 text-sm text-yellow-200">Pour enregistrer : {missing.join(", ")}. Ouvre les paramètres pour les compléter.</p>
          )}
          {error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}
          <button type="button" disabled={busy || missing.length > 0} onClick={() => void createDraft()}
            className="mt-4 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50">
            {busy ? "Enregistrement…" : "Valider et enregistrer mon brouillon"}
          </button>
          <p className="mt-2 text-xs leading-5 text-white/50">La sauvegarde crée un brouillon privé rattaché à ton compte. Pas d'appel OpenAI, de débit IA, d'envoi ou de publication automatique.</p>
        </>
      )}
    </section>
  );
}
