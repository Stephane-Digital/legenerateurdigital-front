"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FaArrowLeft, FaCopy, FaMagic, FaRedo } from "react-icons/fa";

import type { LayerData } from "@/dashboard/automatisations/reseaux_sociaux/carrousel/editor/v5/types/layers";
import LeadEditorLayout from "@/dashboard/automatisations/reseaux_sociaux/carrousel/editor/v5/ui/LeadEditorLayout";
import { buildLeadHtmlExport } from "@/dashboard/lead-engine/utils/exportHtml";

const STORAGE_KEY = "lgd_lead_engine_builder_v4";
const STORAGE_UI_KEY = "lgd_lead_engine_builder_v4_ui";
const STORAGE_CTA_KEY = "lgd_lead_engine_builder_v4_cta_url";

type LeadEditorUIState = {
  formatKey: string;
  bgMode: "color" | "gradient" | "image";
  bgColor: string;
  bgColor1: string;
  bgColor2: string;
  bgAngle: number;
  bgImage: string | null;
  overlayEnabled: boolean;
  overlayType: "color" | "gradient";
  overlayColor1: string;
  overlayColor2: string;
  overlayOpacity: number;
};

function buildLeadPreset(): LayerData[] {
  return [
    {
      id: "lead-title",
      type: "text",
      x: 82,
      y: 88,
      width: 820,
      height: 240,
      visible: true,
      selected: false,
      zIndex: 2,
      text: "Comment générer tes premiers leads qualifiés en 7 jours",
      style: {
        fontSize: 68,
        fontFamily: "Inter",
        color: "#ffffff",
        fontWeight: 800,
        lineHeight: 1.06,
      },
    } as LayerData,
    {
      id: "lead-subtitle",
      type: "text",
      x: 86,
      y: 340,
      width: 770,
      height: 150,
      visible: true,
      selected: false,
      zIndex: 3,
      text: "Une landing premium pensée pour transformer ton audience en vrais prospects sans dépendre uniquement des algorithmes.",
      style: {
        fontSize: 28,
        fontFamily: "Inter",
        color: "#d4d4d8",
        fontWeight: 500,
        lineHeight: 1.35,
      },
    } as LayerData,
    {
      id: "lead-cta",
      type: "text",
      x: 88,
      y: 520,
      width: 420,
      height: 80,
      visible: true,
      selected: false,
      zIndex: 4,
      text: "Recevoir la méthode maintenant",
      style: {
        fontSize: 26,
        fontFamily: "Inter",
        color: "#111111",
        fontWeight: 800,
        lineHeight: 1.2,
        backgroundColor: "#ffb800",
      },
    } as LayerData,
    {
      id: "lead-benefits-title",
      type: "text",
      x: 84,
      y: 780,
      width: 360,
      height: 70,
      visible: true,
      selected: false,
      zIndex: 5,
      text: "Bénéfices",
      style: {
        fontSize: 38,
        fontFamily: "Inter",
        color: "#ffb800",
        fontWeight: 800,
        lineHeight: 1.1,
      },
    } as LayerData,
    {
      id: "lead-benefit-1",
      type: "text",
      x: 88,
      y: 860,
      width: 860,
      height: 72,
      visible: true,
      selected: false,
      zIndex: 6,
      text: "• Attire des prospects plus qualifiés sans complexifier ton marketing.",
      style: {
        fontSize: 26,
        fontFamily: "Inter",
        color: "#ffffff",
        fontWeight: 600,
        lineHeight: 1.25,
      },
    } as LayerData,
    {
      id: "lead-benefit-2",
      type: "text",
      x: 88,
      y: 940,
      width: 860,
      height: 72,
      visible: true,
      selected: false,
      zIndex: 7,
      text: "• Transforme tes contenus en machine à leads plus cohérente.",
      style: {
        fontSize: 26,
        fontFamily: "Inter",
        color: "#ffffff",
        fontWeight: 600,
        lineHeight: 1.25,
      },
    } as LayerData,
    {
      id: "lead-benefit-3",
      type: "text",
      x: 88,
      y: 1020,
      width: 860,
      height: 72,
      visible: true,
      selected: false,
      zIndex: 8,
      text: "• Crée une structure premium qui donne envie de s’inscrire.",
      style: {
        fontSize: 26,
        fontFamily: "Inter",
        color: "#ffffff",
        fontWeight: 600,
        lineHeight: 1.25,
      },
    } as LayerData,
    {
      id: "lead-proof-title",
      type: "text",
      x: 84,
      y: 1180,
      width: 360,
      height: 70,
      visible: true,
      selected: false,
      zIndex: 9,
      text: "Preuve sociale",
      style: {
        fontSize: 38,
        fontFamily: "Inter",
        color: "#ffb800",
        fontWeight: 800,
        lineHeight: 1.1,
      },
    } as LayerData,
    {
      id: "lead-proof-body",
      type: "text",
      x: 88,
      y: 1260,
      width: 860,
      height: 100,
      visible: true,
      selected: false,
      zIndex: 10,
      text: "Cette structure aide à capter plus facilement des leads réellement intéressés par ton offre.",
      style: {
        fontSize: 26,
        fontFamily: "Inter",
        color: "#d4d4d8",
        fontWeight: 500,
        lineHeight: 1.3,
      },
    } as LayerData,
    {
      id: "lead-faq-title",
      type: "text",
      x: 84,
      y: 1440,
      width: 300,
      height: 70,
      visible: true,
      selected: false,
      zIndex: 11,
      text: "FAQ",
      style: {
        fontSize: 38,
        fontFamily: "Inter",
        color: "#ffb800",
        fontWeight: 800,
        lineHeight: 1.1,
      },
    } as LayerData,
    {
      id: "lead-faq-q1",
      type: "text",
      x: 88,
      y: 1520,
      width: 860,
      height: 72,
      visible: true,
      selected: false,
      zIndex: 12,
      text: "Est-ce adapté aux débutants ?",
      style: {
        fontSize: 28,
        fontFamily: "Inter",
        color: "#ffffff",
        fontWeight: 800,
        lineHeight: 1.2,
      },
    } as LayerData,
    {
      id: "lead-faq-a1",
      type: "text",
      x: 88,
      y: 1582,
      width: 860,
      height: 88,
      visible: true,
      selected: false,
      zIndex: 13,
      text: "Oui, la structure a été pensée pour rester simple à mettre en œuvre.",
      style: {
        fontSize: 24,
        fontFamily: "Inter",
        color: "#d4d4d8",
        fontWeight: 500,
        lineHeight: 1.35,
      },
    } as LayerData,
    {
      id: "lead-faq-q2",
      type: "text",
      x: 88,
      y: 1720,
      width: 860,
      height: 72,
      visible: true,
      selected: false,
      zIndex: 14,
      text: "Combien de temps faut-il pour l’utiliser ?",
      style: {
        fontSize: 28,
        fontFamily: "Inter",
        color: "#ffffff",
        fontWeight: 800,
        lineHeight: 1.2,
      },
    } as LayerData,
    {
      id: "lead-faq-a2",
      type: "text",
      x: 88,
      y: 1784,
      width: 860,
      height: 88,
      visible: true,
      selected: false,
      zIndex: 15,
      text: "Le format est conçu pour être actionnable rapidement, sans lecture interminable.",
      style: {
        fontSize: 24,
        fontFamily: "Inter",
        color: "#d4d4d8",
        fontWeight: 500,
        lineHeight: 1.35,
      },
    } as LayerData,
  ];
}

function buildDefaultUI(): LeadEditorUIState {
  return {
    formatKey: "landing",
    bgMode: "color",
    bgColor: "#111111",
    bgColor1: "#111111",
    bgColor2: "#000000",
    bgAngle: 135,
    bgImage: null,
    overlayEnabled: false,
    overlayType: "color",
    overlayColor1: "#000000",
    overlayColor2: "#000000",
    overlayOpacity: 0.35,
  };
}

function safeParseLayers(raw: string | null): LayerData[] | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as LayerData[];
  } catch {
    return null;
  }
}

function safeParseUI(raw: string | null): Partial<LeadEditorUIState> | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as Partial<LeadEditorUIState>;
  } catch {
    return null;
  }
}

export default function LeadEnginePage() {
  const [editorKey, setEditorKey] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [initialLayers, setInitialLayers] = useState<LayerData[]>(() => buildLeadPreset());
  const [initialUI, setInitialUI] = useState<LeadEditorUIState>(() => buildDefaultUI());
  const [layers, setLayers] = useState<LayerData[]>(() => buildLeadPreset());
  const [ctaUrl, setCtaUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState("");

  useEffect(() => {
    try {
      const savedLayers = safeParseLayers(window.localStorage.getItem(STORAGE_KEY));
      const savedUI = safeParseUI(window.localStorage.getItem(STORAGE_UI_KEY));
      const savedCta = window.localStorage.getItem(STORAGE_CTA_KEY) || "";

      const nextLayers =
        savedLayers && savedLayers.length > 0 ? savedLayers : buildLeadPreset();

      const nextUI: LeadEditorUIState = {
        ...buildDefaultUI(),
        ...(savedUI || {}),
      };

      setInitialLayers(nextLayers);
      setLayers(nextLayers);
      setInitialUI(nextUI);
      setCtaUrl(savedCta);
    } catch {
      setInitialLayers(buildLeadPreset());
      setLayers(buildLeadPreset());
      setInitialUI(buildDefaultUI());
      setCtaUrl("");
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    try {
      window.localStorage.setItem(STORAGE_CTA_KEY, ctaUrl);
    } catch {
      // noop
    }
  }, [ctaUrl, hydrated]);

  const htmlExport = useMemo(() => {
    return buildLeadHtmlExport({
      layers,
      ctaUrl,
    });
  }, [layers, ctaUrl]);

  async function copyHtml() {
    try {
      await navigator.clipboard.writeText(htmlExport);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // noop
    }
  }

  function handleLayersChange(nextLayers: LayerData[]) {
    setLayers(nextLayers);
    setLastSavedAt(new Date().toLocaleTimeString());

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextLayers));
    } catch {
      // noop
    }
  }

  function handleUIChange(nextUI: LeadEditorUIState) {
    setInitialUI(nextUI);
    setLastSavedAt(new Date().toLocaleTimeString());

    try {
      window.localStorage.setItem(STORAGE_UI_KEY, JSON.stringify(nextUI));
    } catch {
      // noop
    }
  }

  function resetPreset() {
    const preset = buildLeadPreset();
    const defaultUI = buildDefaultUI();

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preset));
      window.localStorage.setItem(STORAGE_UI_KEY, JSON.stringify(defaultUI));
    } catch {
      // noop
    }

    setInitialLayers(preset);
    setLayers(preset);
    setInitialUI(defaultUI);
    setEditorKey((value) => value + 1);
    setLastSavedAt(new Date().toLocaleTimeString());
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-[1800px] px-6 pb-10 pt-[110px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-yellow-600/25 bg-[#0b0b0b] px-4 py-2 text-sm font-semibold text-yellow-200"
              >
                <FaArrowLeft />
                Retour Dashboard
              </Link>

              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-600/25 bg-[#0b0b0b] px-4 py-1 text-[12px] text-white/75">
                <FaMagic className="text-yellow-300" />
                Lead Builder V4.2.1 — Champ ⇒ Bouton ⇒ SIO
              </div>
            </div>

            <h1 className="text-3xl font-extrabold text-[#ffb800] sm:text-4xl">
              Lead Engine branché sur la vraie structure éditeur
            </h1>
            <p className="mt-2 max-w-3xl text-white/65">
              Le champ CTA ci-dessous alimente directement le bouton exporté en HTML
              Systeme.io. Le fond, l’image et les overlays sont maintenant
              restaurés au refresh.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={copyHtml}
              className="inline-flex items-center gap-2 rounded-2xl border border-yellow-600/25 bg-[#0b0b0b] px-5 py-3 font-semibold text-white/85"
            >
              <FaCopy className="text-yellow-300" />
              {copied ? "HTML copié" : "Exporter HTML SIO"}
            </button>

            <button
              type="button"
              onClick={resetPreset}
              className="inline-flex items-center gap-2 rounded-2xl border border-yellow-600/25 bg-[#0b0b0b] px-5 py-3 font-semibold text-white/85"
            >
              <FaRedo className="text-yellow-300" />
              Réinitialiser le preset
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-[28px] border border-yellow-600/20 bg-[#0b0b0b] p-5">
          <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
            <div>
              <div className="mb-2 text-sm font-semibold text-yellow-300">
                Champ CTA Systeme.io
              </div>
              <div className="text-sm text-white/55">
                Ce champ pilote le lien du bouton exporté. Le flux est maintenant :
                champ ⇒ bouton HTML ⇒ page ou formulaire Systeme.io.
              </div>

              <input
                type="text"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="https://ton-lien-systeme.io/ton-formulaire"
                className="mt-4 w-full rounded-2xl border border-yellow-600/20 bg-[#111] px-4 py-4 text-sm text-white/85 outline-none placeholder:text-white/30"
              />

              <div className="mt-3 text-xs text-white/40">
                Astuce : si tu saisis seulement ton domaine, le HTML exporté le normalise
                automatiquement.
              </div>
            </div>

            <div className="rounded-2xl border border-yellow-600/20 bg-[#111] p-4">
              <div className="text-sm font-semibold text-yellow-300">
                Vérification rapide
              </div>

              <div className="mt-3 space-y-2 text-sm text-white/70">
                <div>
                  <span className="font-semibold text-white/90">Texte du bouton :</span>{" "}
                  extrait automatiquement du layer <code className="text-yellow-300">lead-cta</code>
                </div>
                <div>
                  <span className="font-semibold text-white/90">Lien du bouton :</span>{" "}
                  champ Systeme.io ci-contre
                </div>
                <div>
                  <span className="font-semibold text-white/90">Dernière synchro :</span>{" "}
                  {lastSavedAt || "en attente d’une modification"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-yellow-600/20 bg-[#0b0b0b] p-4 sm:p-5">
          {hydrated ? (
            <LeadEditorLayout
  key={editorKey}
  initialLayers={initialLayers}
  initialLayersKey={`lead-engine-${editorKey}`}
  onChange={handleLayersChange}
/>
          ) : (
            <div className="flex min-h-[680px] items-center justify-center rounded-[20px] border border-yellow-600/15 bg-[#090909] text-sm text-white/45">
              Chargement du lead builder...
            </div>
          )}
        </div>

        <div className="mt-6 rounded-[28px] border border-yellow-600/20 bg-[#0b0b0b] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-yellow-300">
                HTML SIO généré
              </div>
              <div className="mt-1 text-sm text-white/55">
                Le bouton exporté reprend le texte du layer et le lien du champ CTA.
              </div>
            </div>

            <button
              type="button"
              onClick={copyHtml}
              className="rounded-2xl bg-[#ffb800] px-5 py-3 font-semibold text-black"
            >
              {copied ? "Copié" : "Copier le HTML"}
            </button>
          </div>

          <textarea
            readOnly
            value={htmlExport}
            className="mt-4 min-h-[320px] w-full rounded-2xl border border-yellow-600/20 bg-[#111] px-4 py-4 text-sm text-white/80 outline-none"
          />
        </div>
      </div>
    </div>
  );
}
