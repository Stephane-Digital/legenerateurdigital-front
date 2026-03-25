"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
} from "react-icons/fa";

import CardLuxe from "@/components/ui/CardLuxe";

type LeadMagnetType =
  | "checklist"
  | "mini-guide"
  | "template"
  | "ebook"
  | "challenge";

const leadMagnetOptions: { value: LeadMagnetType; label: string }[] = [
  { value: "checklist", label: "Checklist" },
  { value: "mini-guide", label: "Mini-guide" },
  { value: "template", label: "Template" },
  { value: "ebook", label: "Ebook" },
  { value: "challenge", label: "Challenge" },
];

const LS_EDITOR_INTELLIGENT_BRIEF = "lgd_editor_intelligent_brief";
const LS_LEAD_ENGINE_V1 = "lgd_lead_engine_v1";
const LS_EMAIL_CAMPAIGN_LEAD_ENGINE = "lgd_email_campaign_lead_engine";
const LS_LIBRARY_LEAD_ENGINE_DRAFT = "lgd_library_lead_engine_draft";
const LS_SIO_LEAD_MAGNET_TEMPLATE = "lgd_sio_lead_magnet_template";

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
) {
  const magnetName = buildLeadMagnetName(leadType, niche, promise);
  const hook = buildLeadHook(niche, target, promise);
  const cta = buildCTA(promise);
  const landingTitle = buildLandingTitle(target, promise);

  return {
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

  const preview = useMemo(() => {
    return buildLeadPayload(leadType, niche, target, promise);
  }, [leadType, niche, target, promise]);

  function flash(message: string) {
    setActionMsg(message);
    window.setTimeout(() => setActionMsg(""), 3500);
  }

  function handleGenerate() {
    setGenerated(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LS_LEAD_ENGINE_V1, JSON.stringify(preview));
    }
    flash("✅ Base Lead Engine générée.");
  }

  function injectIntoEditor() {
    if (typeof window === "undefined") return;

    const brief = {
      brief:
        `${preview.hook}\n\n` +
        `Lead magnet : ${preview.magnetName}\n` +
        `Promesse : ${preview.promise || "Résultat rapide"}\n` +
        `CTA : ${preview.cta}`,
      source: "lead_engine_v1",
      createdAtISO: new Date().toISOString(),
    };

    window.localStorage.setItem(LS_EDITOR_INTELLIGENT_BRIEF, JSON.stringify(brief));
    window.localStorage.setItem(LS_LEAD_ENGINE_V1, JSON.stringify(preview));
    window.location.href = "/dashboard/automatisations/reseaux_sociaux/editor-intelligent";
  }

  function injectIntoEmailing() {
    if (typeof window === "undefined") return;

    const emailPayload = {
      source: "lead_engine_v1",
      angle: preview.hook,
      offer_name: preview.magnetName,
      promise: preview.promise,
      cta: preview.cta,
      target: preview.target,
      niche: preview.niche,
      createdAt: new Date().toISOString(),
    };

    window.localStorage.setItem(LS_EMAIL_CAMPAIGN_LEAD_ENGINE, JSON.stringify(emailPayload));
    window.localStorage.setItem(LS_LEAD_ENGINE_V1, JSON.stringify(preview));
    window.location.href = "/dashboard/email-campaigns";
  }

  function saveToLibrary() {
    if (typeof window === "undefined") return;

    const libraryPayload = {
      kind: "lgd_lead_engine_v1",
      title: preview.magnetName,
      data: preview,
      createdAt: new Date().toISOString(),
    };

    window.localStorage.setItem(LS_LIBRARY_LEAD_ENGINE_DRAFT, JSON.stringify(libraryPayload));
    flash("✅ Base Lead Engine sauvegardée pour la Bibliothèque.");
  }

  function prepareSioTemplate() {
    if (typeof window === "undefined") return;

    const sioTemplate = {
      source: "lead_engine_v1",
      template_type: "lead_magnet",
      title: preview.magnetName,
      headline: preview.landingTitle,
      subheadline: preview.hook,
      cta: preview.cta,
      niche: preview.niche,
      target: preview.target,
      promise: preview.promise,
      sections: [
        "Hero",
        "Bénéfices",
        "Formulaire email",
        "Call-to-action",
      ],
      createdAt: new Date().toISOString(),
    };

    window.localStorage.setItem(LS_SIO_LEAD_MAGNET_TEMPLATE, JSON.stringify(sioTemplate));
    flash("✅ Template Lead Magnet SIO préparé.");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-6xl px-6 pt-[120px] pb-16">
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
            Lead Engine V2
          </div>

          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-[#ffb800]">
            Crée ton premier aimant à prospects
          </h1>

          <p className="mt-3 max-w-3xl mx-auto text-white/70">
            LGD prépare la base de ton Lead Engine : promesse, lead magnet, hook, CTA
            et premières actions d’injection dans l’écosystème LGD.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 xl:grid-cols-2 gap-8">
          <CardLuxe className="px-6 py-6">
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
          </CardLuxe>

          <CardLuxe className="px-6 py-6">
            <div className="flex items-center gap-3">
              <FaBullseye className="text-[#ffb800] text-2xl" />
              <h2 className="text-2xl font-bold text-[#ffb800]">
                Prévisualisation LGD
              </h2>
            </div>

            <div className="mt-6 grid gap-4">
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
                    La V2 est prête. Tu peux maintenant réinjecter ta base dans l’écosystème LGD.
                  </p>
                </div>
              ) : null}
            </div>
          </CardLuxe>
        </div>

        <div className="mt-10">
          <CardLuxe className="px-6 py-6">
            <div className="flex items-center gap-3">
              <FaRocket className="text-[#ffb800] text-2xl" />
              <h2 className="text-2xl font-bold text-[#ffb800]">
                Utiliser dans LGD
              </h2>
            </div>

            <p className="mt-3 text-white/70 max-w-3xl">
              À partir de cette base, tu peux préparer ton contenu, ton emailing, ta bibliothèque
              et ton template Lead Magnet pour SIO.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <button
                type="button"
                onClick={injectIntoEditor}
                className="rounded-2xl border border-yellow-600/25 bg-[#0b0b0b] px-5 py-4 text-left hover:bg-yellow-500/10 transition-all"
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
                onClick={injectIntoEmailing}
                className="rounded-2xl border border-yellow-600/25 bg-[#0b0b0b] px-5 py-4 text-left hover:bg-yellow-500/10 transition-all"
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
                onClick={saveToLibrary}
                className="rounded-2xl border border-yellow-600/25 bg-[#0b0b0b] px-5 py-4 text-left hover:bg-yellow-500/10 transition-all"
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
                onClick={prepareSioTemplate}
                className="rounded-2xl border border-yellow-600/25 bg-[#0b0b0b] px-5 py-4 text-left hover:bg-yellow-500/10 transition-all"
              >
                <div className="flex items-center gap-3 text-yellow-200 font-semibold">
                  <FaRocket />
                  Template Lead Magnet SIO
                </div>
                <p className="mt-2 text-sm text-white/65">
                  Prépare la structure du template à injecter côté Systeme.io.
                </p>
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 text-sm text-white/65">
              Note importante : dans cette V2, LGD prépare les données et les injections internes.
              Le vrai push API direct vers Systeme.io n’est pas encore branché ici, mais le template
              Lead Magnet SIO est maintenant préparé pour l’intégration.
            </div>
          </CardLuxe>
        </div>
      </div>
    </div>
  );
}
