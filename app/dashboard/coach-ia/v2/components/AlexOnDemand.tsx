"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createAlexEmailDraft } from "../lib/emailDraftApi";
import { validateAlexEmailDraft, type AlexEmailDraft, type AlexEmailDraftContext, type AlexEmailDraftProject } from "../lib/emailDraftBuilder";
import { parseAlexCommand, prepareDraftFromAlexCommand } from "../lib/alexCommandParser";

type TextKey = "name" | "sender_name" | "offer_name" | "target_audience" | "main_promise" | "main_objective" | "primary_cta";
type BoolKey = "include_nurture" | "include_sales" | "include_objection" | "include_relaunch" | "auto_cta" | "optimize_subjects" | "progressive_pressure";
const TEXTS: Array<{ key: TextKey; label: string; wide?: boolean }> = [
  { key: "name", label: "Nom de la campagne" },
  { key: "sender_name", label: "Nom réel de l'expéditeur" },
  { key: "offer_name", label: "Offre / produit" },
  { key: "target_audience", label: "À qui s'adressent les emails ?", wide: true },
  { key: "main_promise", label: "Promesse réelle de l'offre", wide: true },
  { key: "main_objective", label: "Objectif précis", wide: true },
  { key: "primary_cta", label: "Appel à l'action", wide: true },
];
const BOOLS: Array<{ key: BoolKey; label: string }> = [
  { key: "include_nurture", label: "Éducation / valeur" },
  { key: "include_sales", label: "Vente" },
  { key: "include_objection", label: "Objections" },
  { key: "include_relaunch", label: "Relance" },
  { key: "auto_cta", label: "CTA optimisés" },
  { key: "optimize_subjects", label: "Objets optimisés" },
  { key: "progressive_pressure", label: "Progression commerciale" },
];

function apiBase() { return (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").trim().replace(/\/+$/, ""); }
function token() {
  if (typeof window === "undefined") return "";
  return ["access_token", "lgd_token", "token", "jwt"]
    .map((k) => window.localStorage.getItem(k)?.trim() || "").find(Boolean) || "";
}
function asObject(v: unknown): Record<string, unknown> | null {
  return v !== null && typeof v === "object" && !Array.isArray(v) ? v as Record<string, unknown> : null;
}

async function loadAlexBusinessContext(): Promise<{ context: AlexEmailDraftContext | null; project: AlexEmailDraftProject | null; warning: string }> {
  const auth = token();
  const options: RequestInit = {
    method: "GET", credentials: "include", cache: "no-store",
    headers: auth ? { Authorization: `Bearer ${auth}` } : {},
  };
  const base = apiBase();
  const [projectResult, profileResult] = await Promise.allSettled([
    fetch(`${base}/coach-profile/business-project`, options),
    fetch(`${base}/coach-profile`, options),
  ]);
  let project: AlexEmailDraftProject | null = null;
  let context: AlexEmailDraftContext | null = null;
  let unavailable = false;
  if (projectResult.status === "fulfilled" && projectResult.value.ok) {
    const body = asObject(await projectResult.value.json().catch(() => null));
    project = asObject(body?.alex_business_project) as AlexEmailDraftProject | null;
  } else { unavailable = true; }
  if (profileResult.status === "fulfilled" && profileResult.value.ok) {
    const body = asObject(await profileResult.value.json().catch(() => null));
    const profile = asObject(body?.profile);
    const snap = asObject(profile?.coach_v2);
    context = asObject(snap?.context) as AlexEmailDraftContext | null;
  } else { unavailable = true; }
  return { context, project, warning: unavailable ? "Une partie du profil Alex n'a pas pu être chargée. Vérifie les informations manquantes avant de sauvegarder." : "" };
}

export default function AlexOnDemand() {
  const router = useRouter();
  const [request, setRequest] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<AlexEmailDraft | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [advanced, setAdvanced] = useState(false);
  const inFlight = useRef(false);
  const inputClass = "mt-1 w-full rounded-xl border border-yellow-500/25 bg-[#090d14] px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-yellow-400 focus:outline-none";

  const start = useCallback(async (text: string) => {
    if (inFlight.current) return;
    const command = parseAlexCommand(text);
    setOpen(true);
    setRequest(text);
    setDraft(null); setSavedId(null); setError(""); setAdvanced(false);
    if (command.kind !== "email") {
      setMessage("Je peux déjà préparer ta campagne Emailing IA à la demande. Pour les posts, carrousels et tunnels, l'exécution directe sera ajoutée dans les prochains lots. Demande-moi par exemple : « Prépare 5 emails pour mon offre ». ");
      return;
    }
    if (command.requestedUnsupportedDays !== null) {
      setMessage(`Tu demandes ${command.requestedUnsupportedDays} emails/jours. Le module Emailing IA accepte actuellement 5 ou 7 jours. Reformule ta demande avec 5 ou 7, sans changer silencieusement ton choix.`);
      return;
    }
    inFlight.current = true; setBusy(true); setMessage("Je récupère ton projet Business pour préparer les paramètres de campagne…");
    try {
      const { context, project, warning } = await loadAlexBusinessContext();
      const prepared = prepareDraftFromAlexCommand(command, context, project);
      setDraft(prepared);
      setMessage(`J'ai préparé ${prepared.duration_days} jours d'Emailing IA${prepared.offer_name ? ` pour « ${prepared.offer_name} »` : ""}. ${warning} Vérifie les informations, complète les champs manquants puis valide : je n'enverrai aucun email.`);
    } catch {
      setError("Impossible de lire ton projet actuellement. Réessaie ; aucun brouillon n'a été enregistré.");
      setMessage("");
    } finally { inFlight.current = false; setBusy(false); }
  }, []);

  function update<K extends keyof AlexEmailDraft>(key: K, value: AlexEmailDraft[K]) {
    setDraft(old => old ? { ...old, [key]: value } : old);
    setError("");
  }
  async function save() {
    if (!draft || inFlight.current || savedId !== null) return;
    const invalid = validateAlexEmailDraft(draft);
    if (invalid.length) { setError(`Il manque : ${invalid.join(", ")}.`); return; }
    inFlight.current = true; setBusy(true); setError("");
    try {
      const id = await createAlexEmailDraft(draft, { apiBase: apiBase(), token: token() });
      setSavedId(id);
      setMessage(`Ton brouillon #${id} est enregistré dans Emailing IA. Je n'ai généré ni envoyé aucun email.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "La sauvegarde a échoué.");
    } finally { inFlight.current = false; setBusy(false); }
  }
  const missing = draft ? validateAlexEmailDraft(draft) : [];
  return (
    <section aria-label="Demander une action à Coach Alex" className="mx-auto w-full max-w-6xl px-4 pt-5 sm:px-6">
      <div className="rounded-3xl border border-yellow-500/30 bg-gradient-to-br from-[#151c2b] via-[#0d1320] to-[#100e09] p-4 text-white shadow-xl sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.19em] text-yellow-300/80">Coach Alex · À la demande</div>
            <h2 className="mt-2 text-xl font-semibold text-yellow-100 sm:text-2xl">C'est toi qui décides de l'action</h2>
            <p className="mt-1 text-sm leading-6 text-white/70">Tu peux demander une campagne email à tout moment, même sans attendre ta prochaine mission.</p>
          </div>
          <button type="button" className="rounded-xl border border-yellow-500/30 px-3 py-2 text-xs font-semibold text-yellow-200 hover:bg-yellow-400/10" onClick={() => setOpen(v => !v)} aria-expanded={open}>
            {open ? "Masquer l'espace de travail" : "Ouvrir l'espace de travail"}
          </button>
        </div>
        <form className="mt-4 space-y-3" onSubmit={(e) => { e.preventDefault(); void start(request); }}>
          <label htmlFor="alex-command-text" className="block text-sm font-semibold text-yellow-100">Que souhaites-tu que je prépare ?</label>
          <textarea id="alex-command-text" rows={2} maxLength={1500} value={request} onChange={e => setRequest(e.target.value)} placeholder="Alex, prépare 5 emails pédagogiques pour vendre mon ebook…" className={inputClass + " resize-y"}/>
          <div className="flex flex-wrap items-center gap-2">
            <button type="submit" disabled={busy || !request.trim()} className="rounded-xl bg-yellow-400 px-5 py-3 text-sm font-bold text-black hover:bg-yellow-300 disabled:opacity-50">{busy && savedId === null ? "Alex prépare…" : "Demander à Alex"}</button>
            <button type="button" disabled={busy} className="rounded-xl border border-white/20 px-3 py-3 text-xs font-semibold text-white/80 hover:bg-white/10" onClick={() => void start("Alex, prépare une campagne de 5 emails pour mon offre.")}>Campagne 5 emails</button>
            <button type="button" disabled={busy} className="rounded-xl border border-white/20 px-3 py-3 text-xs font-semibold text-white/80 hover:bg-white/10" onClick={() => void start("Alex, prépare une campagne de 7 emails pour mon offre.")}>Campagne 7 emails</button>
          </div>
        </form>
        {open && (
          <div className="mt-5 space-y-4 border-t border-yellow-500/20 pt-4">
            {message && <p role="status" className="rounded-xl border border-yellow-500/20 bg-yellow-400/5 p-3 text-sm leading-6 text-white/85">{message}</p>}
            {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-900/20 p-3 text-sm text-red-200">{error}</p>}
            {draft && savedId === null && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-base font-bold text-yellow-200">Brouillon à valider · {draft.duration_days} jours</h3>
                  <span className="text-xs text-white/60">Préparation gratuite · aucun email généré</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {TEXTS.map(({ key, label, wide }) => (
                    <label key={key} className={wide ? "sm:col-span-2" : ""}>
                      <span className="text-xs font-semibold text-white/75">{label}</span>
                      {wide ? <textarea rows={2} maxLength={1800} className={inputClass} value={draft[key]} onChange={e => update(key, e.target.value)}/>
                        : <input maxLength={key === "name" ? 255 : 255} className={inputClass} value={draft[key]} onChange={e => update(key, e.target.value)} />}
                    </label>
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <label><span className="text-xs font-semibold text-white/75">Type de campagne</span><select className={inputClass} value={draft.campaign_type} onChange={e => update("campaign_type", e.target.value as AlexEmailDraft["campaign_type"])}><option value="vente">Vente</option><option value="nurturing">Pédagogique / nurturing</option><option value="lancement">Lancement</option><option value="relance">Relance</option></select></label>
                  <label><span className="text-xs font-semibold text-white/75">Durée</span><select className={inputClass} value={draft.duration_days} onChange={e => update("duration_days", Number(e.target.value) as 5 | 7)}><option value={5}>5 jours</option><option value={7}>7 jours</option></select></label>
                  <label><span className="text-xs font-semibold text-white/75">Ton</span><select className={inputClass} value={draft.tone} onChange={e => update("tone", e.target.value as AlexEmailDraft["tone"])}><option value="premium">Premium</option><option value="direct">Direct</option><option value="storytelling">Storytelling</option><option value="pedagogique">Pédagogique</option></select></label>
                  <label><span className="text-xs font-semibold text-white/75">Intensité</span><select className={inputClass} value={draft.sales_intensity} onChange={e => update("sales_intensity", e.target.value as AlexEmailDraft["sales_intensity"])}><option value="doux">Douce</option><option value="modere">Modérée</option><option value="fort">Forte</option></select></label>
                </div>
                <button type="button" className="rounded-xl border border-yellow-500/30 px-3 py-2 text-xs font-semibold text-yellow-100" onClick={() => setAdvanced(v => !v)} aria-expanded={advanced}>{advanced ? "Masquer les options" : "Afficher les 7 optimisations"}</button>
                {advanced && <div className="grid gap-3 rounded-xl border border-yellow-500/20 p-3 sm:grid-cols-2">{BOOLS.map(({ key, label }) => <label key={key} className="flex items-center gap-2 text-xs text-white/85"><input type="checkbox" checked={draft[key]} onChange={e => update(key, e.target.checked)}/>{label}</label>)}</div>}
                {missing.length > 0 && <p className="text-sm text-yellow-200">À compléter : {missing.join(", ")}.</p>}
                <button type="button" onClick={() => void save()} disabled={busy || missing.length > 0} className="rounded-xl bg-yellow-400 px-5 py-3 text-sm font-bold text-black hover:bg-yellow-300 disabled:opacity-50">{busy ? "Enregistrement…" : "Valider et enregistrer dans Emailing IA"}</button>
                <p className="text-xs text-white/55">Seul un brouillon privé est sauvegardé. Il ne sera ni généré, ni envoyé, ni publié automatiquement.</p>
              </div>
            )}
            {savedId !== null && (
              <div className="space-y-2">
                <button type="button" className="rounded-xl bg-yellow-400 px-5 py-3 text-sm font-bold text-black hover:bg-yellow-300" onClick={() => router.push("/dashboard/email-campaigns")}>Ouvrir Emailing IA</button>
                <p className="text-xs text-white/65">Dans « Campagnes enregistrées », ouvre le brouillon #{savedId} pour retrouver les paramètres et générer les emails uniquement si tu le souhaites.</p>
                <button type="button" className="block text-xs text-yellow-200 underline" onClick={() => { setDraft(null); setSavedId(null); setRequest(""); setMessage(""); setError(""); }}>Nouvelle demande</button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
