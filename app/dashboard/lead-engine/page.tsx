"use client";

import CardLuxe from "@/components/ui/CardLuxe";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaEnvelopeOpenText,
  FaMagic,
  FaBullseye,
  FaGift,
  FaEdit,
  FaMailBulk,
  FaFolderOpen,
  FaRocket,
  FaHistory,
  FaRedo,
  FaTrash,
  FaTimes,
} from "react-icons/fa";

type LeadMagnetType =
  | "checklist"
  | "mini-guide"
  | "template"
  | "ebook"
  | "challenge";

type LeadEnginePayload = {
  id: string;
  leadType: LeadMagnetType;
  niche: string;
  target: string;
  promise: string;
  magnetName: string;
  hook: string;
  cta: string;
  landingTitle: string;
  createdAt: string;
};

type SavedBaseAction =
  | "reuse"
  | "editor"
  | "emailing"
  | "sio"
  | "delete";

const leadMagnetOptions: { value: LeadMagnetType; label: string }[] = [
  { value: "checklist", label: "Checklist" },
  { value: "mini-guide", label: "Mini-guide" },
  { value: "template", label: "Template" },
  { value: "ebook", label: "Ebook" },
  { value: "challenge", label: "Challenge" },
];

const savedBaseActionOptions: { value: SavedBaseAction; label: string }[] = [
  { value: "reuse", label: "Réutiliser cette base" },
  { value: "editor", label: "Vers l’Éditeur" },
  { value: "emailing", label: "Vers Emailing" },
  { value: "sio", label: "Template SIO" },
  { value: "delete", label: "Supprimer cette base" },
];

const LS_EDITOR_INTELLIGENT_BRIEF = "lgd_editor_intelligent_brief";
const LS_LEAD_ENGINE_V1 = "lgd_lead_engine_v1";
const LS_EMAIL_CAMPAIGN_LEAD_ENGINE = "lgd_email_campaign_lead_engine";
const LS_LIBRARY_LEAD_ENGINE_DRAFT = "lgd_library_lead_engine_draft";
const LS_SIO_LEAD_MAGNET_TEMPLATE = "lgd_sio_lead_magnet_template";
const LS_LEAD_ENGINE_BASES = "lgd_lead_engine_bases";

function buildLeadHook(niche: string, target: string, promise: string) {
  const n = niche.trim() || "ton marché";
  const t = target.trim() || "ta cible";
  const p = promise.trim() || "un premier résultat rapide";
  return `Le guide express pour aider ${t} à obtenir ${p} dans ${n}.`;
}

function buildLeadMagnetName(type: LeadMagnetType, niche: string, promise: string) {
  const label = leadMagnetOptions.find((item) => item.value === type)?.label || "Lead Magnet";
  const n = niche.trim() || "Business en ligne";
  const p = promise.trim() || "un meilleur résultat";
  return `${label} IA — ${n} pour ${p}`;
}

function buildCTA(promise: string) {
  const p = promise.trim() || "ton prochain résultat";
  return `Télécharger maintenant pour obtenir ${p}`;
}

function buildLandingTitle(target: string, promise: string) {
  const t = target.trim() || "ta cible";
  const p = promise.trim() || "un résultat concret";
  return `Obtiens ${p} grâce à ce lead magnet pensé pour ${t}`;
}

function buildLeadPayload(
  leadType: LeadMagnetType,
  niche: string,
  target: string,
  promise: string
): LeadEnginePayload {
  const magnetName = buildLeadMagnetName(leadType, niche, promise);
  const hook = buildLeadHook(niche, target, promise);
  const cta = buildCTA(promise);
  const landingTitle = buildLandingTitle(target, promise);

  return {
    id: `${Date.now()}`,
    leadType,
    niche: niche.trim(),
    target: target.trim(),
    promise: promise.trim(),
    magnetName,
    hook,
    cta,
    landingTitle,
    createdAt: new Date().toISOString(),
  };
}

export default function LeadEnginePage() {
  const [niche, setNiche] = useState("");
  const [target, setTarget] = useState("");
  const [promise, setPromise] = useState("");
  const [leadType, setLeadType] = useState<LeadMagnetType>("checklist");
  const [generated, setGenerated] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [savedBases, setSavedBases] = useState<LeadEnginePayload[]>([]);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [selectedActions, setSelectedActions] = useState<Record<string, SavedBaseAction>>({});

  const preview = useMemo(() => {
    return buildLeadPayload(leadType, niche, target, promise);
  }, [leadType, niche, target, promise]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(LS_LEAD_ENGINE_BASES);
      if (!raw) return;
      const parsed = JSON.parse(raw) as LeadEnginePayload[];
      setSavedBases(Array.isArray(parsed) ? parsed : []);
    } catch {
      // ignore
    }
  }, []);

  function flash(message: string) {
    setActionMsg(message);
    window.setTimeout(() => setActionMsg(""), 3500);
  }

  function persistBases(next: LeadEnginePayload[]) {
    setSavedBases(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LS_LEAD_ENGINE_BASES, JSON.stringify(next));
    }
  }

  function handleGenerate() {
    setGenerated(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LS_LEAD_ENGINE_V1, JSON.stringify(preview));
    }
    flash("✅ Base Lead Engine générée.");
  }

  function injectIntoEditor(payload: LeadEnginePayload) {
    if (typeof window === "undefined") return;

    const brief = {
      brief:
        `${payload.hook}\n\n` +
        `Lead magnet : ${payload.magnetName}\n` +
        `Promesse : ${payload.promise || "Résultat rapide"}\n` +
        `CTA : ${payload.cta}`,
      source: "lead_engine_v5",
      createdAtISO: new Date().toISOString(),
    };

    window.localStorage.setItem(LS_EDITOR_INTELLIGENT_BRIEF, JSON.stringify(brief));
    window.localStorage.setItem(LS_LEAD_ENGINE_V1, JSON.stringify(payload));
    window.location.href = "/dashboard/automatisations/reseaux_sociaux/editor-intelligent";
  }

  function injectIntoEmailing(payload: LeadEnginePayload) {
    if (typeof window === "undefined") return;

    const emailPayload = {
      source: "lead_engine_v5",
      angle: payload.hook,
      offer_name: payload.magnetName,
      promise: payload.promise,
      cta: payload.cta,
      target: payload.target,
      niche: payload.niche,
      createdAt: new Date().toISOString(),
    };

    window.localStorage.setItem(LS_EMAIL_CAMPAIGN_LEAD_ENGINE, JSON.stringify(emailPayload));
    window.localStorage.setItem(LS_LEAD_ENGINE_V1, JSON.stringify(payload));
    window.location.href = "/dashboard/email-campaigns";
  }

  function saveToLibrary(payload: LeadEnginePayload) {
    if (typeof window === "undefined") return;

    const libraryPayload = {
      kind: "lgd_lead_engine_v5",
      title: payload.magnetName,
      data: payload,
      createdAt: new Date().toISOString(),
    };

    window.localStorage.setItem(LS_LIBRARY_LEAD_ENGINE_DRAFT, JSON.stringify(libraryPayload));
    flash("✅ Base Lead Engine sauvegardée pour la Bibliothèque.");
  }

  function prepareSioTemplate(payload: LeadEnginePayload) {
    if (typeof window === "undefined") return;

    const sioTemplate = {
      source: "lead_engine_v5",
      template_type: "lead_magnet",
      title: payload.magnetName,
      headline: payload.landingTitle,
      subheadline: payload.hook,
      cta: payload.cta,
      niche: payload.niche,
      target: payload.target,
      promise: payload.promise,
      sections: ["Hero", "Bénéfices", "Formulaire email", "Call-to-action"],
      createdAt: new Date().toISOString(),
    };

    window.localStorage.setItem(LS_SIO_LEAD_MAGNET_TEMPLATE, JSON.stringify(sioTemplate));
    flash("✅ Template Lead Magnet SIO préparé.");
  }

  function saveCurrentBase() {
    const exists = savedBases.some((item) => item.id === preview.id || item.magnetName === preview.magnetName);
    const next = exists ? savedBases : [preview, ...savedBases];
    persistBases(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LS_LEAD_ENGINE_V1, JSON.stringify(preview));
    }
    flash("✅ Base Lead Engine sauvegardée.");
  }

  function reuseBase(payload: LeadEnginePayload) {
    setNiche(payload.niche);
    setTarget(payload.target);
    setPromise(payload.promise);
    setLeadType(payload.leadType);
    setGenerated(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LS_LEAD_ENGINE_V1, JSON.stringify(payload));
    }
    flash("✅ Base Lead Engine rechargée.");
  }

  function deleteBase(id: string) {
    const next = savedBases.filter((item) => item.id !== id);
    persistBases(next);
    setSelectedActions((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    flash("🗑️ Base Lead Engine supprimée.");
  }

  function runSavedBaseAction(item: LeadEnginePayload) {
    const action = selectedActions[item.id] || "reuse";

    if (action === "reuse") {
      reuseBase(item);
      return;
    }
    if (action === "editor") {
      injectIntoEditor(item);
      return;
    }
    if (action === "emailing") {
      injectIntoEmailing(item);
      return;
    }
    if (action === "sio") {
      prepareSioTemplate(item);
      return;
    }
    deleteBase(item.id);
  }

  const activePayload = generated ? preview : preview;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-7xl px-6 pt-[120px] pb-16">
        <div className="flex items-start justify-between gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-yellow-600/25 bg-[#0b0b0b] px-4 py-2 text-sm font-semibold text-yellow-200 hover:bg-yellow-500/10 transition-all"
          >
            <FaArrowLeft />
            Retour au Dashboard
          </Link>
        </div>

        <div className="mt-10 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-yellow-600/25 bg-[#0b0b0b] px-4 py-1 text-[12px] text-white/75">
            <FaEnvelopeOpenText className="text-yellow-300" />
            Lead Engine V5
          </div>

          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-[#ffb800]">
            Crée ton premier aimant à prospects
          </h1>

          <p className="mt-3 max-w-3xl mx-auto text-white/70">
            LGD prépare la base de ton Lead Engine : promesse, lead magnet, hook, CTA,
            stockage réutilisable et injections concrètes dans l’écosystème LGD.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 xl:grid-cols-2 gap-8 items-stretch">
          <CardLuxe className="block w-full min-w-0 h-full px-6 py-6">
            <div className="flex h-full flex-col">
              <div className="flex items-center gap-3">
                <FaMagic className="text-[#ffb800] text-2xl" />
                <h2 className="text-2xl font-bold text-[#ffb800]">
                  Configuration rapide
                </h2>
              </div>

              <div className="mt-6 grid gap-5">
                <div>
                  <label className="block text-sm font-semibold text-yellow-200 mb-2">
                    Ta niche / thématique
                  </label>
                  <input
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="Ex : vendre des ebooks, MRR, business en ligne..."
                    className="w-full rounded-2xl border border-yellow-600/25 bg-[#0b0b0b] px-4 py-3 text-white outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-yellow-200 mb-2">
                    Ta cible
                  </label>
                  <input
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="Ex : débutants, coaches, infopreneurs..."
                    className="w-full rounded-2xl border border-yellow-600/25 bg-[#0b0b0b] px-4 py-3 text-white outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-yellow-200 mb-2">
                    Résultat / promesse principale
                  </label>
                  <input
                    value={promise}
                    onChange={(e) => setPromise(e.target.value)}
                    placeholder="Ex : obtenir des leads qualifiés, vendre plus vite..."
                    className="w-full rounded-2xl border border-yellow-600/25 bg-[#0b0b0b] px-4 py-3 text-white outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-yellow-200 mb-2">
                    Type de lead magnet
                  </label>
                  <select
                    value={leadType}
                    onChange={(e) => setLeadType(e.target.value as LeadMagnetType)}
                    className="w-full rounded-2xl border border-yellow-600/25 bg-[#0b0b0b] px-4 py-3 text-white outline-none focus:border-yellow-400"
                  >
                    {leadMagnetOptions.map((option) => (
                      <option key={option.value} value={option.value} className="bg-[#0b0b0b]">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  className="mt-2 w-full rounded-2xl px-5 py-3 font-semibold bg-gradient-to-r from-[#ffb800] to-[#ffcc4d] text-black hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-500/20 transition-all"
                >
                  Générer ma base Lead Engine
                </button>

                {actionMsg ? (
                  <div className="rounded-2xl border border-yellow-500/25 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">
                    {actionMsg}
                  </div>
                ) : null}
              </div>

              <div className="mt-6 rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 text-sm text-white/65">
                Note importante : dans cette V5, LGD effectue les injections internes
                vers l’Éditeur et l’Emailing via stockage local. Le push API direct vers Systeme.io
                n’est pas encore branché ici, mais le template Lead Magnet SIO est préparé.
              </div>

              <div className="mt-6 border-t border-yellow-600/15 pt-6">
                <div className="flex items-center gap-3">
                  <FaRocket className="text-[#ffb800] text-2xl" />
                  <h2 className="text-2xl font-bold text-[#ffb800]">
                    Utiliser dans LGD
                  </h2>
                </div>

                <p className="mt-3 text-white/70">
                  À partir de cette base, tu peux préparer ton contenu, ton emailing,
                  ta bibliothèque et ton template Lead Magnet pour SIO.
                </p>

                <div className="mt-6 flex flex-col gap-4">
                  <button
                    type="button"
                    onClick={() => injectIntoEditor(activePayload)}
                    className="w-full rounded-2xl border border-yellow-600/25 bg-[#0b0b0b] px-5 py-4 text-left hover:bg-yellow-500/10 transition-all"
                  >
                    <div className="flex items-center gap-3 text-yellow-200 font-semibold">
                      <FaEdit />
                      Injecter dans l’Éditeur
                    </div>
                    <p className="mt-2 text-sm text-white/65">
                      Envoie le hook, la promesse et le CTA dans l’éditeur intelligent.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => injectIntoEmailing(activePayload)}
                    className="w-full rounded-2xl border border-yellow-600/25 bg-[#0b0b0b] px-5 py-4 text-left hover:bg-yellow-500/10 transition-all"
                  >
                    <div className="flex items-center gap-3 text-yellow-200 font-semibold">
                      <FaMailBulk />
                      Injecter dans Emailing
                    </div>
                    <p className="mt-2 text-sm text-white/65">
                      Prépare la base pour la séquence email liée à ce lead magnet.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => saveToLibrary(activePayload)}
                    className="w-full rounded-2xl border border-yellow-600/25 bg-[#0b0b0b] px-5 py-4 text-left hover:bg-yellow-500/10 transition-all"
                  >
                    <div className="flex items-center gap-3 text-yellow-200 font-semibold">
                      <FaFolderOpen />
                      Sauvegarder en Bibliothèque
                    </div>
                    <p className="mt-2 text-sm text-white/65">
                      Garde cette base Lead Engine pour la réutiliser plus tard.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => prepareSioTemplate(activePayload)}
                    className="w-full rounded-2xl border border-yellow-600/25 bg-[#0b0b0b] px-5 py-4 text-left hover:bg-yellow-500/10 transition-all"
                  >
                    <div className="flex items-center gap-3 text-yellow-200 font-semibold">
                      <FaRocket />
                      Template Lead Magnet SIO
                    </div>
                    <p className="mt-2 text-sm text-white/65">
                      Prépare la structure du template à injecter côté Systeme.io.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLibraryOpen(true)}
                    className="w-full rounded-2xl border border-yellow-600/25 bg-[#111] px-5 py-4 text-left hover:bg-yellow-500/10 transition-all"
                  >
                    <div className="flex items-center gap-3 text-yellow-200 font-semibold">
                      <FaHistory />
                      Ouvrir la modale Bibliothèque
                    </div>
                    <p className="mt-2 text-sm text-white/65">
                      Consulte toutes tes bases Lead Engine dans une modale dédiée.
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </CardLuxe>

          <CardLuxe className="block w-full min-w-0 h-full px-6 py-6">
            <div className="flex h-full flex-col">
              <div className="flex items-center gap-3">
                <FaBullseye className="text-[#ffb800] text-2xl" />
                <h2 className="text-2xl font-bold text-[#ffb800]">
                  Prévisualisation LGD
                </h2>
              </div>

              <div className="mt-6 flex flex-1 flex-col gap-4">
                <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4">
                  <div className="text-yellow-200 font-semibold">Nom du lead magnet</div>
                  <p className="mt-2 text-white/80">{preview.magnetName}</p>
                </div>

                <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4">
                  <div className="text-yellow-200 font-semibold">Hook / angle</div>
                  <p className="mt-2 text-white/80">{preview.hook}</p>
                </div>

                <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4">
                  <div className="text-yellow-200 font-semibold">CTA de capture</div>
                  <p className="mt-2 text-white/80">{preview.cta}</p>
                </div>

                <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4">
                  <div className="flex items-center gap-2 text-yellow-200 font-semibold">
                    <FaGift />
                    Suite prévue
                  </div>
                  <p className="mt-2 text-white/70 text-sm">
                    Étape suivante : génération complète de la page de capture, du contenu du lead magnet
                    et des CTA prêts à injecter dans les contenus LGD.
                  </p>
                </div>

                {generated ? (
                  <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-center">
                    <div className="text-yellow-200 font-semibold">Base Lead Engine générée</div>
                    <p className="mt-2 text-sm text-white/75">
                      La V5 est prête. Tu peux maintenant réinjecter ta base dans l’écosystème LGD.
                    </p>
                  </div>
                ) : null}

                <div className="mt-2 border-t border-yellow-600/15 pt-6">
                  <div className="flex items-center gap-3">
                    <FaHistory className="text-[#ffb800] text-2xl" />
                    <h2 className="text-2xl font-bold text-[#ffb800]">
                      Base générée
                    </h2>
                  </div>

                  <div className="mt-6 flex flex-col gap-4">
                    <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4">
                      <div className="text-yellow-200 font-semibold">Titre</div>
                      <p className="mt-2 text-white/80">{activePayload.magnetName}</p>
                    </div>

                    <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4">
                      <div className="text-yellow-200 font-semibold">Hook</div>
                      <p className="mt-2 text-white/80">{activePayload.hook}</p>
                    </div>

                    <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4">
                      <div className="text-yellow-200 font-semibold">CTA</div>
                      <p className="mt-2 text-white/80">{activePayload.cta}</p>
                    </div>

                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={saveCurrentBase}
                        className="w-full rounded-2xl px-5 py-3 font-semibold bg-gradient-to-r from-[#ffb800] to-[#ffcc4d] text-black hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-500/20 transition-all"
                      >
                        Sauvegarder cette base
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardLuxe>
        </div>
      </div>

      {libraryOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/75"
            onClick={() => setLibraryOpen(false)}
          />
          <div className="relative z-[101] w-full max-w-5xl">
            <div className="rounded-[28px] border border-yellow-600/20 bg-gradient-to-b from-[#111] to-[#0b0b0b] p-6 shadow-2xl sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-yellow-600/25 bg-[#0b0b0b] px-4 py-1 text-[12px] text-white/75">
                    <FaHistory className="text-yellow-300" />
                    Bibliothèque Lead Engine
                  </div>
                  <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-[#ffb800]">
                    Mes bases Lead Engine
                  </h2>
                  <p className="mt-2 text-white/65">
                    Toutes tes bases sont stockées ici, dans une modale dédiée style bibliothèque LGD.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setLibraryOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-yellow-600/25 bg-[#0b0b0b] px-3 py-3 text-yellow-200 hover:bg-yellow-500/10 transition-all"
                  aria-label="Fermer la bibliothèque"
                >
                  <FaTimes />
                </button>
              </div>

              {savedBases.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-6 text-white/65">
                  Aucune base sauvegardée pour le moment.
                </div>
              ) : (
                <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-5 max-h-[65vh] overflow-y-auto pr-1">
                  {savedBases.map((item) => {
                    const currentAction = selectedActions[item.id] || "reuse";

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-5"
                      >
                        <div className="text-yellow-200 font-semibold">{item.magnetName}</div>
                        <p className="mt-2 text-sm text-white/70">{item.hook}</p>
                        <p className="mt-2 text-sm text-white/55">CTA : {item.cta}</p>

                        <div className="mt-4 grid gap-3">
                          <select
                            value={currentAction}
                            onChange={(e) =>
                              setSelectedActions((prev) => ({
                                ...prev,
                                [item.id]: e.target.value as SavedBaseAction,
                              }))
                            }
                            className="w-full rounded-2xl border border-yellow-600/25 bg-[#111] px-4 py-3 text-sm text-white outline-none focus:border-yellow-400"
                          >
                            {savedBaseActionOptions.map((option) => (
                              <option
                                key={`${item.id}-${option.value}`}
                                value={option.value}
                                className="bg-[#111]"
                              >
                                {option.label}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => runSavedBaseAction(item)}
                            className={[
                              "w-full rounded-2xl px-4 py-3 text-sm font-semibold transition-all",
                              currentAction === "delete"
                                ? "border border-red-500/25 bg-red-500/10 text-red-100 hover:bg-red-500/15"
                                : "bg-gradient-to-r from-[#ffb800] to-[#ffcc4d] text-black hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-500/20",
                            ].join(" ")}
                          >
                            {currentAction === "delete" ? (
                              <span className="inline-flex items-center gap-2">
                                <FaTrash />
                                Exécuter l’action
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-2">
                                <FaRedo />
                                Exécuter l’action
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
