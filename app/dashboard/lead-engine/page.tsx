"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaArrowLeft,
  FaCopy,
  FaExpandArrowsAlt,
  FaMagic,
  FaRedo,
} from "react-icons/fa";

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
      x: 74,
      y: 86,
      width: 560,
      height: 220,
      visible: true,
      selected: false,
      zIndex: 2,
      text: "Comment générer tes premiers leads qualifiés en 7 jours",
      style: {
        fontSize: 60,
        fontFamily: "Inter",
        color: "#ffffff",
        fontWeight: 800,
        lineHeight: 1.04,
      },
    } as LayerData,
    {
      id: "lead-subtitle",
      type: "text",
      x: 78,
      y: 320,
      width: 530,
      height: 136,
      visible: true,
      selected: false,
      zIndex: 3,
      text: "Une landing premium pensée pour transformer ton audience en vrais prospects sans dépendre uniquement des algorithmes.",
      style: {
        fontSize: 24,
        fontFamily: "Inter",
        color: "#e4e4e7",
        fontWeight: 500,
        lineHeight: 1.45,
      },
    } as LayerData,
    {
      id: "lead-cta",
      type: "text",
      x: 78,
      y: 474,
      width: 330,
      height: 72,
      visible: true,
      selected: false,
      zIndex: 4,
      text: "Recevoir la méthode maintenant",
      style: {
        fontSize: 22,
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
      x: 74,
      y: 620,
      width: 240,
      height: 60,
      visible: true,
      selected: false,
      zIndex: 5,
      text: "Bénéfices",
      style: {
        fontSize: 34,
        fontFamily: "Inter",
        color: "#ffb800",
        fontWeight: 800,
        lineHeight: 1.1,
      },
    } as LayerData,
    {
      id: "lead-benefit-1",
      type: "text",
      x: 78,
      y: 688,
      width: 520,
      height: 64,
      visible: true,
      selected: false,
      zIndex: 6,
      text: "• Attire des prospects plus qualifiés sans complexifier ton marketing.",
      style: {
        fontSize: 20,
        fontFamily: "Inter",
        color: "#ffffff",
        fontWeight: 600,
        lineHeight: 1.32,
      },
    } as LayerData,
    {
      id: "lead-benefit-2",
      type: "text",
      x: 78,
      y: 754,
      width: 520,
      height: 64,
      visible: true,
      selected: false,
      zIndex: 7,
      text: "• Transforme tes contenus en machine à leads plus cohérente.",
      style: {
        fontSize: 20,
        fontFamily: "Inter",
        color: "#ffffff",
        fontWeight: 600,
        lineHeight: 1.32,
      },
    } as LayerData,
    {
      id: "lead-benefit-3",
      type: "text",
      x: 78,
      y: 820,
      width: 520,
      height: 64,
      visible: true,
      selected: false,
      zIndex: 8,
      text: "• Crée une structure premium qui donne envie de s’inscrire.",
      style: {
        fontSize: 20,
        fontFamily: "Inter",
        color: "#ffffff",
        fontWeight: 600,
        lineHeight: 1.32,
      },
    } as LayerData,
    {
      id: "lead-proof-title",
      type: "text",
      x: 74,
      y: 960,
      width: 340,
      height: 60,
      visible: true,
      selected: false,
      zIndex: 9,
      text: "Preuve sociale",
      style: {
        fontSize: 34,
        fontFamily: "Inter",
        color: "#ffb800",
        fontWeight: 800,
        lineHeight: 1.1,
      },
    } as LayerData,
    {
      id: "lead-proof-body",
      type: "text",
      x: 78,
      y: 1028,
      width: 860,
      height: 92,
      visible: true,
      selected: false,
      zIndex: 10,
      text: "Cette structure aide à capter plus facilement des leads réellement intéressés par ton offre.",
      style: {
        fontSize: 24,
        fontFamily: "Inter",
        color: "#d4d4d8",
        fontWeight: 500,
        lineHeight: 1.4,
      },
    } as LayerData,
    {
      id: "lead-faq-title",
      type: "text",
      x: 74,
      y: 1188,
      width: 220,
      height: 60,
      visible: true,
      selected: false,
      zIndex: 11,
      text: "FAQ",
      style: {
        fontSize: 34,
        fontFamily: "Inter",
        color: "#ffb800",
        fontWeight: 800,
        lineHeight: 1.1,
      },
    } as LayerData,
    {
      id: "lead-faq-q1",
      type: "text",
      x: 78,
      y: 1256,
      width: 860,
      height: 60,
      visible: true,
      selected: false,
      zIndex: 12,
      text: "Est-ce adapté aux débutants ?",
      style: {
        fontSize: 26,
        fontFamily: "Inter",
        color: "#ffffff",
        fontWeight: 800,
        lineHeight: 1.2,
      },
    } as LayerData,
    {
      id: "lead-faq-a1",
      type: "text",
      x: 78,
      y: 1318,
      width: 860,
      height: 82,
      visible: true,
      selected: false,
      zIndex: 13,
      text: "Oui, la structure a été pensée pour rester simple à mettre en œuvre.",
      style: {
        fontSize: 22,
        fontFamily: "Inter",
        color: "#d4d4d8",
        fontWeight: 500,
        lineHeight: 1.38,
      },
    } as LayerData,
    {
      id: "lead-faq-q2",
      type: "text",
      x: 78,
      y: 1450,
      width: 860,
      height: 60,
      visible: true,
      selected: false,
      zIndex: 14,
      text: "Combien de temps faut-il pour l’utiliser ?",
      style: {
        fontSize: 26,
        fontFamily: "Inter",
        color: "#ffffff",
        fontWeight: 800,
        lineHeight: 1.2,
      },
    } as LayerData,
    {
      id: "lead-faq-a2",
      type: "text",
      x: 78,
      y: 1512,
      width: 860,
      height: 82,
      visible: true,
      selected: false,
      zIndex: 15,
      text: "Le format est conçu pour être actionnable rapidement, sans lecture interminable.",
      style: {
        fontSize: 22,
        fontFamily: "Inter",
        color: "#d4d4d8",
        fontWeight: 500,
        lineHeight: 1.38,
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
    return Array.isArray(parsed) ? (parsed as LayerData[]) : null;
  } catch {
    return null;
  }
}

function safeParseUI(raw: string | null): Partial<LeadEditorUIState> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Partial<LeadEditorUIState>) : null;
  } catch {
    return null;
  }
}

function getText(layer: any) {
  return typeof layer?.text === "string" ? layer.text : "";
}

function estimateTextHeight(text: string, width: number, fontSize: number, lineHeight: number) {
  const safeWidth = Math.max(220, width);
  const safeFontSize = Math.max(14, fontSize);
  const safeLineHeight = Math.max(1.1, lineHeight || 1.2);

  const charsPerLine = Math.max(10, Math.floor(safeWidth / (safeFontSize * 0.58)));
  const lines = Math.max(1, Math.ceil(String(text || "").length / charsPerLine));

  return Math.ceil(lines * safeFontSize * safeLineHeight + 20);
}

function cloneLayer(layer: LayerData): LayerData {
  return JSON.parse(JSON.stringify(layer)) as LayerData;
}

function autoSizeHero(layers: LayerData[]): LayerData[] {
  const next = layers.map(cloneLayer);

  const find = (idPart: string) => next.find((layer: any) => String(layer.id).includes(idPart));

  const title = find("lead-title");
  const subtitle = find("lead-subtitle");
  const cta = find("lead-cta");
  const benefitsTitle = find("lead-benefits-title");
  const benefit1 = find("lead-benefit-1");
  const benefit2 = find("lead-benefit-2");
  const benefit3 = find("lead-benefit-3");

  const imageLayer = next.find(
    (layer: any) => layer?.type === "image" && typeof layer?.src === "string" && !!layer?.src
  ) as any;

  if (!title || !subtitle || !cta || !benefitsTitle || !benefit1 || !benefit2 || !benefit3) {
    return next;
  }

  title.x = 74;
  title.y = 86;
  title.width = 560;
  title.height = estimateTextHeight(
    getText(title),
    Number(title.width ?? 560),
    Number((title as any)?.style?.fontSize ?? 60),
    Number((title as any)?.style?.lineHeight ?? 1.04)
  );

  subtitle.x = 78;
  subtitle.y = Number(title.y) + Number(title.height) + 28;
  subtitle.width = 530;
  subtitle.height = estimateTextHeight(
    getText(subtitle),
    Number(subtitle.width ?? 530),
    Number((subtitle as any)?.style?.fontSize ?? 24),
    Number((subtitle as any)?.style?.lineHeight ?? 1.45)
  );

  cta.x = 78;
  cta.y = Number(subtitle.y) + Number(subtitle.height) + 24;
  cta.width = Math.max(320, Math.min(420, getText(cta).length * 10 + 110));
  cta.height = Math.max(
    64,
    estimateTextHeight(
      getText(cta),
      Number(cta.width ?? 330),
      Number((cta as any)?.style?.fontSize ?? 22),
      Number((cta as any)?.style?.lineHeight ?? 1.2)
    ) + 8
  );

  benefitsTitle.x = 74;
  benefitsTitle.y = Number(cta.y) + Number(cta.height) + 72;

  benefit1.x = 78;
  benefit1.y = Number(benefitsTitle.y) + Number(benefitsTitle.height) + 14;
  benefit1.width = 520;
  benefit1.height = estimateTextHeight(
    getText(benefit1),
    Number(benefit1.width ?? 520),
    Number((benefit1 as any)?.style?.fontSize ?? 20),
    Number((benefit1 as any)?.style?.lineHeight ?? 1.32)
  );

  benefit2.x = 78;
  benefit2.y = Number(benefit1.y) + Number(benefit1.height) + 10;
  benefit2.width = 520;
  benefit2.height = estimateTextHeight(
    getText(benefit2),
    Number(benefit2.width ?? 520),
    Number((benefit2 as any)?.style?.fontSize ?? 20),
    Number((benefit2 as any)?.style?.lineHeight ?? 1.32)
  );

  benefit3.x = 78;
  benefit3.y = Number(benefit2.y) + Number(benefit2.height) + 10;
  benefit3.width = 520;
  benefit3.height = estimateTextHeight(
    getText(benefit3),
    Number(benefit3.width ?? 520),
    Number((benefit3 as any)?.style?.fontSize ?? 20),
    Number((benefit3 as any)?.style?.lineHeight ?? 1.32)
  );

  if (imageLayer) {
    imageLayer.x = 622;
    imageLayer.y = 86;

    const heroTextBottom = Math.max(
      Number(cta.y) + Number(cta.height),
      Number(benefit3.y) + Number(benefit3.height)
    );

    imageLayer.width = 318;
    imageLayer.height = Math.max(560, heroTextBottom - 56);

    if (!imageLayer.style) imageLayer.style = {};
    imageLayer.style.objectFit = "contain";
    imageLayer.style.objectPosition = "center center";
  }

  return next;
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
  const inlineNoticeShownRef = useRef(false);

  useEffect(() => {
    try {
      const savedLayers = safeParseLayers(window.localStorage.getItem(STORAGE_KEY));
      const savedUI = safeParseUI(window.localStorage.getItem(STORAGE_UI_KEY));
      const savedCta = window.localStorage.getItem(STORAGE_CTA_KEY) || "";

      const nextLayers =
        savedLayers && savedLayers.length > 0 ? autoSizeHero(savedLayers) : buildLeadPreset();

      const nextUI: LeadEditorUIState = {
        ...buildDefaultUI(),
        ...(savedUI || {}),
      };

      setInitialLayers(nextLayers);
      setLayers(nextLayers);
      setInitialUI(nextUI);
      setCtaUrl(savedCta);

      if (!savedLayers) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextLayers));
      }
    } catch {
      const preset = buildLeadPreset();
      setInitialLayers(preset);
      setLayers(preset);
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

  function applyHeroAutoLayout() {
    const normalized = autoSizeHero(layers);

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch {
      // noop
    }

    setInitialLayers(normalized);
    setLayers(normalized);
    setEditorKey((value) => value + 1);
    setLastSavedAt(new Date().toLocaleTimeString());
  }

  function showInlineBaseMessage() {
    if (inlineNoticeShownRef.current) return;

    inlineNoticeShownRef.current = true;
    window.alert(
      "Base inline activée : pour l’instant, le texte reste édité via le panneau de propriétés de droite. L’étape suivante branchera le double-clic direct sur le canvas sans toucher au V5 verrouillé."
    );
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
                Lead Builder V4.2.2 — HERO auto + Inline base
              </div>
            </div>

            <h1 className="text-3xl font-extrabold text-[#ffb800] sm:text-4xl">
              Lead Engine branché sur la vraie structure éditeur
            </h1>
            <p className="mt-2 max-w-3xl text-white/65">
              La zone HERO peut maintenant être auto-réajustée selon le contenu.
              Le visuel hero est repositionné pour rester entier au maximum.
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
          <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr_0.85fr]">
            <div>
              <div className="mb-2 text-sm font-semibold text-yellow-300">
                Champ CTA Systeme.io
              </div>
              <div className="text-sm text-white/55">
                Ce champ pilote le lien du bouton exporté. Flux : champ ⇒ bouton HTML ⇒ page ou formulaire Systeme.io.
              </div>

              <input
                type="text"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="https://ton-lien-systeme.io/ton-formulaire"
                className="mt-4 w-full rounded-2xl border border-yellow-600/20 bg-[#111] px-4 py-4 text-sm text-white/85 outline-none placeholder:text-white/30"
              />
            </div>

            <div className="rounded-2xl border border-yellow-600/20 bg-[#111] p-4">
              <div className="text-sm font-semibold text-yellow-300">
                HERO automatique
              </div>

              <div className="mt-2 text-sm text-white/60">
                Ajuste le bloc hero selon le volume de texte. Le visuel est replacé à droite et agrandi pour rester entier.
              </div>

              <button
                type="button"
                onClick={applyHeroAutoLayout}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#ffb800] px-4 py-3 text-sm font-bold text-black"
              >
                <FaExpandArrowsAlt />
                Auto-ajuster la zone HERO
              </button>
            </div>

            <div className="rounded-2xl border border-yellow-600/20 bg-[#111] p-4">
              <div className="text-sm font-semibold text-yellow-300">
                Inline base
              </div>

              <div className="mt-2 text-sm text-white/60">
                Base préparée : l’étape suivante branchera le double-clic direct sur le texte. Pour l’instant, l’édition se fait via le panneau de droite.
              </div>

              <button
                type="button"
                onClick={showInlineBaseMessage}
                className="mt-4 rounded-xl border border-yellow-600/25 px-4 py-3 text-sm font-semibold text-white/85"
              >
                Voir le statut inline
              </button>

              <div className="mt-3 text-xs text-white/40">
                Dernière synchro : {lastSavedAt || "en attente d’une modification"}
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
