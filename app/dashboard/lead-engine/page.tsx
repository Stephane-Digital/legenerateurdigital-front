"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FaArrowLeft, FaEnvelopeOpenText, FaMagic, FaBullseye, FaGift } from "react-icons/fa";

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

export default function LeadEnginePage() {
  const [niche, setNiche] = useState("");
  const [target, setTarget] = useState("");
  const [promise, setPromise] = useState("");
  const [leadType, setLeadType] = useState<LeadMagnetType>("checklist");
  const [generated, setGenerated] = useState(false);

  const preview = useMemo(() => {
    return {
      magnetName: buildLeadMagnetName(leadType, niche, promise),
      hook: buildLeadHook(niche, target, promise),
      cta: buildCTA(promise),
    };
  }, [leadType, niche, target, promise]);

  function handleGenerate() {
    setGenerated(true);
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
            Lead Engine V1
          </div>

          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-[#ffb800]">
            Crée ton premier aimant à prospects
          </h1>

          <p className="mt-3 max-w-3xl mx-auto text-white/70">
            LGD prépare la base de ton Lead Engine : promesse, lead magnet, hook et CTA.
            Objectif : transformer ton audience en emails le plus vite possible.
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
                    La V1 est prête. Prochaine étape : transformer cette base en vraie machine à emails.
                  </p>
                </div>
              ) : null}
            </div>
          </CardLuxe>
        </div>
      </div>
    </div>
  );
}
