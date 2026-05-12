"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaArrowLeft,
  FaCopy,
  FaDownload,
  FaImage,
  FaMagic,
  FaRedo,
  FaSave,
  FaTrash,
} from "react-icons/fa";

import type { LayerData } from "@/dashboard/automatisations/reseaux_sociaux/carrousel/editor/v5/types/layers";
import LeadEditorLayout from "@/dashboard/automatisations/reseaux_sociaux/carrousel/editor/v5/ui/LeadEditorLayout";
import { buildLeadHtmlExport } from "@/dashboard/lead-engine/utils/exportHtml";

const STORAGE_KEY = "lgd_lead_engine_builder_v4";
const STORAGE_CTA_KEY = "lgd_lead_engine_builder_v4_cta_url";
const STORAGE_CANVAS_HEIGHT_KEY =
  "lgd_lead_engine_builder_v4_canvas_height_manual";
const STORAGE_ARCHIVES_KEY = "lgd_lead_engine_builder_v4_archives";
const CMO_MODULE_AUTO_PAYLOAD_KEY = "lgd_cmo_module_auto_payload";

const DEFAULT_CTA_URL = "https://legenerateurdigital.systeme.io/lgd";
const EXPORT_CANVAS_WIDTH = 1080;

type SavedArchive = {
  id: string;
  name: string;
  createdAt: string;
  layers: LayerData[];
  ctaUrl: string;
  canvasHeight: number;
};

type AIQuotaState = {
  plan: string;
  remaining: number;
  tokens_used: number;
  tokens_limit: number;
};

const DEFAULT_AI_QUOTA: AIQuotaState = {
  plan: "essentiel",
  remaining: 0,
  tokens_used: 0,
  tokens_limit: 0,
};

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};

  const token =
    window.localStorage.getItem("access_token") ||
    window.localStorage.getItem("lgd_token") ||
    window.localStorage.getItem("token") ||
    window.localStorage.getItem("jwt") ||
    "";

  return token ? { Authorization: `Bearer ${token}` } : {};
}

function normalizeLayersSnapshot(
  raw: LayerData[] | null | undefined,
): LayerData[] {
  if (!Array.isArray(raw)) return [];

  try {
    const cloned = JSON.parse(JSON.stringify(raw));
    return Array.isArray(cloned)
      ? cloned.filter((item) => !!item && typeof item === "object")
      : [];
  } catch {
    return [];
  }
}

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
  ];
}

function pickCmoString(
  payload: Record<string, any>,
  keys: string[],
  fallback = "",
) {
  for (const key of keys) {
    const value = payload?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value))
      return String(value);
  }
  return fallback;
}

function isLeadEngineCmoPayload(
  payload: Record<string, any> | null | undefined,
) {
  if (!payload || typeof payload !== "object") return false;
  const rawModule = String(
    payload.module || payload.targetModule || payload.destination || "",
  ).toLowerCase();
  const rawPath = String(
    payload.path || payload.href || payload.url || "",
  ).toLowerCase();
  return (
    rawModule.includes("lead") ||
    rawModule.includes("funnel") ||
    rawPath.includes("/dashboard/lead-engine")
  );
}

function buildCmoLeadBrief(payload: Record<string, any>) {
  const audience = pickCmoString(
    payload,
    ["audience", "target", "cible"],
    "une audience qualifiée",
  );
  const offer = pickCmoString(
    payload,
    ["offer", "offer_name", "product", "produit", "magnetName"],
    "une offre premium",
  );
  const objective = pickCmoString(
    payload,
    ["objective", "goal", "objectif"],
    "transformer l’attention en prospects qualifiés",
  );
  const promise = pickCmoString(
    payload,
    ["promise", "promesse", "mainPromise"],
    "obtenir un résultat clair rapidement",
  );
  const angle = pickCmoString(
    payload,
    ["angle", "hook", "headline"],
    "landing premium orientée conversion",
  );
  const cta = pickCmoString(
    payload,
    ["cta", "ctaText", "cta_label"],
    "Recevoir l’accès maintenant",
  );

  return [
    `Audience : ${audience}`,
    `Offre : ${offer}`,
    `Objectif : ${objective}`,
    `Promesse : ${promise}`,
    `Angle : ${angle}`,
    `CTA : ${cta}`,
  ].join("\n");
}

function buildLeadPresetFromCmo(payload: Record<string, any>): LayerData[] {
  const preset = buildLeadPreset();
  const audience = pickCmoString(
    payload,
    ["audience", "target", "cible"],
    "ton audience idéale",
  );
  const offer = pickCmoString(
    payload,
    ["offer", "offer_name", "product", "produit", "magnetName"],
    "ton offre premium",
  );
  const objective = pickCmoString(
    payload,
    ["objective", "goal", "objectif"],
    "convertir plus de prospects qualifiés",
  );
  const promise = pickCmoString(
    payload,
    ["promise", "promesse", "mainPromise"],
    "obtenir un résultat clair et rapide",
  );
  const headline = pickCmoString(
    payload,
    ["headline", "title", "name", "campaignName", "campaign_name"],
    `Transforme ${audience} en prospects qualifiés`,
  );
  const subtitle = pickCmoString(
    payload,
    ["subtitle", "description", "brief", "context"],
    `Une landing premium construite par le CMO IA pour présenter ${offer}, clarifier la promesse et guider ${audience} vers l’action.`,
  );
  const cta = pickCmoString(
    payload,
    ["cta", "ctaText", "cta_label"],
    "Recevoir l’accès maintenant",
  );

  return preset.map((layer: any) => {
    if (!layer || typeof layer !== "object") return layer;

    if (layer.id === "lead-title") {
      return { ...layer, text: headline } as LayerData;
    }

    if (layer.id === "lead-subtitle") {
      return { ...layer, text: subtitle } as LayerData;
    }

    if (layer.id === "lead-cta") {
      return { ...layer, text: cta } as LayerData;
    }

    if (layer.id === "lead-benefit-1") {
      return {
        ...layer,
        text: `• Clarifie l’offre ${offer} pour donner envie de s’inscrire.`,
      } as LayerData;
    }

    if (layer.id === "lead-benefit-2") {
      return {
        ...layer,
        text: `• Convertit ${audience} avec une promesse simple : ${promise}.`,
      } as LayerData;
    }

    if (layer.id === "lead-benefit-3") {
      return {
        ...layer,
        text: `• Oriente chaque section vers l’objectif : ${objective}.`,
      } as LayerData;
    }

    return layer as LayerData;
  });
}

function safeParseLayers(raw: string | null): LayerData[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    const normalized = normalizeLayersSnapshot(
      Array.isArray(parsed) ? (parsed as LayerData[]) : null,
    );
    return normalized.length > 0 ? normalized : null;
  } catch {
    return null;
  }
}

function safeParseHeight(raw: string | null): number | null {
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return Math.max(1200, Math.min(5000, Math.round(n)));
}

function safeParseArchives(raw: string | null): SavedArchive[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;

        const layers = normalizeLayersSnapshot((item as SavedArchive).layers);
        if (layers.length === 0) return null;

        return {
          id: String(
            (item as SavedArchive).id ||
              `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
          ),
          name: String((item as SavedArchive).name || "Archive sans nom"),
          createdAt: String(
            (item as SavedArchive).createdAt || new Date().toISOString(),
          ),
          layers,
          ctaUrl: String((item as SavedArchive).ctaUrl || DEFAULT_CTA_URL),
          canvasHeight:
            safeParseHeight(
              String((item as SavedArchive).canvasHeight ?? ""),
            ) ?? 1800,
        } as SavedArchive;
      })
      .filter(Boolean) as SavedArchive[];
  } catch {
    return [];
  }
}

function normalizeExportUrl(url: string) {
  const value = String(url || "").trim();
  if (!value) return DEFAULT_CTA_URL;
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/") ||
    value.startsWith("#")
  ) {
    return value;
  }
  return `https://${value}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function toNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function getLayerStyle(layer: any) {
  return ((layer?.style ?? {}) as Record<string, any>) || {};
}

function getTextColor(style: Record<string, any>) {
  return String(style.fill || style.color || style.textColor || "#ffffff");
}

type LeadSection = {
  title: string;
  body: string;
};

const LEAD_SECTION_ORDER = [
  "HOOK ANTI-SCROLL",
  "HERO",
  "DOULEUR / IDENTIFICATION",
  "BENEFICES",
  "MECANISME",
  "PREUVE / RASSURANCE",
  "OBJECTIONS",
  "CTA FINAL",
  "FAQ COURTE",
  "A UTILISER EN PRIORITE",
];

const LEAD_SECTION_ALIASES: Record<string, string> = {
  HOOK: "HOOK ANTI-SCROLL",
  "HOOK ANTI SCROLL": "HOOK ANTI-SCROLL",
  "HOOK ANTI-SCROLL": "HOOK ANTI-SCROLL",
  "ANTI SCROLL": "HOOK ANTI-SCROLL",
  HERO: "HERO",
  IDENTIFICATION: "DOULEUR / IDENTIFICATION",
  DOULEUR: "DOULEUR / IDENTIFICATION",
  "DOULEUR IDENTIFICATION": "DOULEUR / IDENTIFICATION",
  "DOULEUR / IDENTIFICATION": "DOULEUR / IDENTIFICATION",
  "CE QUE TU VAS RECEVOIR": "BENEFICES",
  "CE QUE VOUS ALLEZ RECEVOIR": "BENEFICES",
  BENEFICE: "BENEFICES",
  BENEFICES: "BENEFICES",
  BÉNÉFICES: "BENEFICES",
  PROMESSE: "BENEFICES",
  "PROMESSE DU LEAD MAGNET": "BENEFICES",
  "POURQUOI CA DEBLOQUE": "MECANISME",
  "POURQUOI ÇA DÉBLOQUE": "MECANISME",
  MECANISME: "MECANISME",
  MÉCANISME: "MECANISME",
  "COMMENT CA MARCHE": "MECANISME",
  "COMMENT ÇA MARCHE": "MECANISME",
  RASSURANCE: "PREUVE / RASSURANCE",
  PREUVE: "PREUVE / RASSURANCE",
  "PREUVE / RASSURANCE": "PREUVE / RASSURANCE",
  OBJECTION: "OBJECTIONS",
  OBJECTIONS: "OBJECTIONS",
  CTA: "CTA FINAL",
  "CTA FINAL": "CTA FINAL",
  "MICRO FAQ": "FAQ COURTE",
  FAQ: "FAQ COURTE",
  "FAQ COURTE": "FAQ COURTE",
  "A UTILISER EN PRIORITE": "A UTILISER EN PRIORITE",
  "À UTILISER EN PRIORITÉ": "A UTILISER EN PRIORITE",
  "BLOC PRIORITAIRE A INJECTER": "A UTILISER EN PRIORITE",
  "BLOC PRIORITAIRE À INJECTER": "A UTILISER EN PRIORITE",
  REASSURANCE: "PREUVE / RASSURANCE",
  MICRO_TRANSFORMATION: "MECANISME",
  TRANSFORMATION: "MECANISME",
  ACTIVATION: "CTA FINAL",
  AUTHORITY: "PREUVE / RASSURANCE",
  AUTORITE: "PREUVE / RASSURANCE",
};

function cleanLeadLine(value: string) {
  return String(value || "")
    .replace(/^\s*[{\[]\s*$/g, "")
    .replace(/^\s*[}\]]\s*,?\s*$/g, "")
    .replace(/^\s*"?(title|heading|name|type|body|text|content|copy|value|sections|blocks|landing)"?\s*:\s*/i, "")
    .replace(/^\s*"/, "")
    .replace(/",?\s*$/, "")
    .replace(/^#{1,6}\s*/g, "")
    .replace(/\*\*/g, "")
    .replace(/^\[\s*LGD_BLOCK\s*:\s*([^\]]+)\]\s*/i, "$1")
    .replace(/\[\s*\/\s*LGD_BLOCK\s*\]/gi, "")
    .replace(/^[•\-–]\s*/g, "• ")
    .trim();
}

function extractLeadValue(content: string, labels: string[]) {
  const lines = String(content || "").split(/\r?\n/);
  for (const label of labels) {
    const re = new RegExp(`^${label}\\s*[:：-]\\s*(.+)$`, "i");
    for (const line of lines) {
      const match = cleanLeadLine(line).match(re);
      if (match?.[1]?.trim()) return match[1].trim();
    }
  }
  return "";
}

function stripAccents(value: string) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeLeadHeading(value: string) {
  const raw = cleanLeadLine(value)
    .replace(/^BLOC\s*\d+\s*(?:[—–-]|:)?\s*/i, "")
    .replace(/^BLOCK\s*\d+\s*(?:[—–-]|:)?\s*/i, "")
    .replace(/^SECTION\s*\d+\s*(?:[—–-]|:)?\s*/i, "")
    .replace(/^\d+[.)]\s*/i, "")
    .replace(/[:：]\s*$/g, "")
    .trim();

  const normalized = stripAccents(raw)
    .toUpperCase()
    .replace(/[’']/g, " ")
    .replace(/\s*[—–-]\s*/g, " ")
    .replace(/\s*\/\s*/g, " / ")
    .replace(/\s+/g, " ")
    .trim();

  if (LEAD_SECTION_ALIASES[raw.toUpperCase()])
    return LEAD_SECTION_ALIASES[raw.toUpperCase()];
  if (LEAD_SECTION_ALIASES[normalized]) return LEAD_SECTION_ALIASES[normalized];

  if (normalized.includes("HERO")) return "HERO";
  if (normalized.includes("IDENTIFICATION") || normalized.includes("DOULEUR"))
    return "DOULEUR / IDENTIFICATION";
  if (
    normalized.includes("RECEVOIR") ||
    normalized.includes("BENEFICE") ||
    normalized.includes("PROMESSE")
  )
    return "BENEFICES";
  if (
    normalized.includes("MECANISME") ||
    normalized.includes("DEBLOQUE") ||
    normalized.includes("COMMENT CA MARCHE")
  )
    return "MECANISME";
  if (normalized.includes("RASSURANCE") || normalized.includes("PREUVE"))
    return "PREUVE / RASSURANCE";
  if (normalized.includes("OBJECTION")) return "OBJECTIONS";
  if (normalized.includes("CTA FINAL") || normalized === "CTA")
    return "CTA FINAL";
  if (normalized.includes("FAQ")) return "FAQ COURTE";
  if (
    normalized.includes("PRIORITAIRE") ||
    normalized.includes("UTILISER EN PRIORITE")
  )
    return "A UTILISER EN PRIORITE";
  if (normalized.includes("HOOK")) return "HOOK ANTI-SCROLL";

  return "";
}

function splitInlineLeadHeading(
  line: string,
): { title: string; body: string } | null {
  const cleaned = cleanLeadLine(line);
  if (!cleaned) return null;

  const inlineMatch = cleaned.match(
    /^(.{2,80}?)(?:\s*[:：]\s+|\s+[—–-]\s+)(.+)$/,
  );
  if (!inlineMatch) return null;

  const title = normalizeLeadHeading(inlineMatch[1] || "");
  const body = String(inlineMatch[2] || "").trim();

  if (!title || !body) return null;
  return { title, body };
}


function stringifyLeadJsonValue(value: unknown): string {
  if (value === null || value === undefined) return "";

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => stringifyLeadJsonValue(item))
      .filter(Boolean)
      .join("\n");
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const preferredKeys = [
      "body",
      "text",
      "content",
      "copy",
      "paragraph",
      "description",
      "value",
      "message",
      "titre",
      "title",
      "subtitle",
      "sous_titre",
      "cta",
    ];

    const directParts = preferredKeys
      .map((key) => stringifyLeadJsonValue(record[key]))
      .filter(Boolean);

    if (directParts.length > 0) return directParts.join("\n");

    return Object.entries(record)
      .map(([key, entry]) => {
        const normalizedKey = normalizeLeadHeading(key);
        const valueText = stringifyLeadJsonValue(entry);
        if (!valueText) return "";
        return normalizedKey ? `${normalizedKey}\n${valueText}` : valueText;
      })
      .filter(Boolean)
      .join("\n");
  }

  return "";
}

function normalizeLeadAiRawContent(content: string): string {
  const raw = String(content || "")
    .replace(/```(?:json|JSON|ts|typescript)?/g, "")
    .replace(/```/g, "")
    .trim();

  if (!raw) return "";

  const candidates = [raw];
  const firstBrace = raw.search(/[\[{]/);
  const lastBrace = Math.max(raw.lastIndexOf("}"), raw.lastIndexOf("]"));
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    candidates.push(raw.slice(firstBrace, lastBrace + 1));
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);

      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => {
            if (typeof item === "string") return item;
            const record = (item || {}) as Record<string, unknown>;
            const title = normalizeLeadHeading(
              String(record.title || record.heading || record.name || record.type || ""),
            );
            const body = stringifyLeadJsonValue(
              record.body || record.text || record.content || record.copy || record.value || item,
            );
            return title ? `${title}\n${body}` : body;
          })
          .filter(Boolean)
          .join("\n\n");
      }

      if (parsed && typeof parsed === "object") {
        const record = parsed as Record<string, unknown>;
        const sectionsValue = record.sections || record.blocks || record.landing || record.content;

        if (Array.isArray(sectionsValue)) {
          return sectionsValue
            .map((item) => {
              const section = (item || {}) as Record<string, unknown>;
              const title = normalizeLeadHeading(
                String(section.title || section.heading || section.name || section.type || ""),
              );
              const body = stringifyLeadJsonValue(
                section.body || section.text || section.content || section.copy || section.value || item,
              );
              return title ? `${title}\n${body}` : body;
            })
            .filter(Boolean)
            .join("\n\n");
        }

        return LEAD_SECTION_ORDER
          .map((title) => {
            const matchingKey = Object.keys(record).find(
              (key) => normalizeLeadHeading(key) === title,
            );
            if (!matchingKey) return "";
            const body = stringifyLeadJsonValue(record[matchingKey]);
            return body ? `${title}\n${body}` : "";
          })
          .filter(Boolean)
          .join("\n\n") || stringifyLeadJsonValue(record);
      }
    } catch {
      // Not JSON. Continue with text cleanup below.
    }
  }

  return raw
    .replace(/^\s*[{\[]\s*$/gm, "")
    .replace(/^\s*[}\]]\s*,?\s*$/gm, "")
    .replace(/^\s*"?(title|heading|name|type|body|text|content|copy|value|sections|blocks|landing)"?\s*:\s*/gim, "")
    .replace(/^\s*"?([A-ZÀ-Ÿ_ /-]{3,80})"?\s*:\s*$/gm, "$1")
    .replace(/^\s*"?([A-ZÀ-Ÿ_ /-]{3,80})"?\s*:\s*/gm, "$1\n")
    .replace(/[",]+\s*$/gm, "")
    .trim();
}

function parseLeadSections(content: string): LeadSection[] {
  const text = normalizeLeadAiRawContent(content)
    .replace(/\n/g, "")
    .replace(/\[\s*LGD_BLOCK\s*:\s*([^\]]+)\]\s*/gi, "\n$1\n")
    .replace(/\[\s*\/\s*LGD_BLOCK\s*\]\s*/gi, "\n")
    .replace(/^\s*[{\[]\s*$/gm, "")
    .replace(/^\s*[}\]]\s*,?\s*$/gm, "")
    .trim();
  if (!text) return [];

  const sections: LeadSection[] = [];
  let currentTitle = "";
  let currentLines: string[] = [];

  const flush = () => {
    const body = cleanLeadBody(currentLines.join("\n"));
    if (currentTitle && body) sections.push({ title: currentTitle, body });
    currentLines = [];
  };

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line) {
      if (currentLines.length > 0) currentLines.push("");
      continue;
    }

    const inlineHeading = splitInlineLeadHeading(line);

    if (inlineHeading) {
      flush();
      currentTitle = inlineHeading.title;
      currentLines.push(inlineHeading.body);
      continue;
    }

    const detected = normalizeLeadHeading(line);

    if (detected) {
      flush();
      currentTitle = detected;
      continue;
    }

    if (!currentTitle && line) currentTitle = "CONTENU LANDING";
    currentLines.push(rawLine);
  }

  flush();

  if (sections.length === 0) {
    return [{ title: "CONTENU LANDING", body: cleanLeadBody(text) }];
  }

  const merged: LeadSection[] = [];
  for (const section of sections) {
    const last = merged[merged.length - 1];
    if (last && last.title === section.title) {
      last.body = `${last.body}\n${section.body}`.trim();
    } else {
      merged.push({ title: section.title, body: cleanLeadBody(section.body) });
    }
  }

  return merged;
}

function shortLines(content: string, maxLines: number) {
  return String(content || "")
    .split(/\r?\n/)
    .map(cleanLeadLine)
    .filter(Boolean)
    .slice(0, maxLines)
    .join("\n");
}

function cleanLeadBody(content: string) {
  return String(content || "")
    .replace(/\[\s*LGD_BLOCK\s*:\s*([^\]]+)\]\s*/gi, "")
    .replace(/\[\s*\/\s*LGD_BLOCK\s*\]\s*/gi, "")
    .split(/\r?\n/)
    .map((line) => cleanLeadLine(line))
    .filter(Boolean)
    .join("\n")
    .trim();
}

function estimateLeadTextHeight(
  text: string,
  width: number,
  fontSize: number,
  lineHeight = 1.3,
) {
  const safeText = String(text || "").trim();
  if (!safeText) return Math.round(fontSize * lineHeight * 2);

  const averageCharWidth = Math.max(7, fontSize * 0.54);
  const charsPerLine = Math.max(18, Math.floor(width / averageCharWidth));
  const visualLines = safeText.split(/\r?\n/).reduce((total, line) => {
    const length = Math.max(1, cleanLeadLine(line).length);
    return total + Math.max(1, Math.ceil(length / charsPerLine));
  }, 0);

  return Math.ceil(visualLines * fontSize * lineHeight + 22);
}

function buildStructuredLandingLayers(
  content: string,
  ctaUrl: string,
): { layers: LayerData[]; canvasHeight: number } | null {
  const sections = parseLeadSections(content);
  if (sections.length === 0) return null;

  const byTitle = new Map(
    sections.map((section) => [section.title, section.body]),
  );
  const hook = byTitle.get("HOOK ANTI-SCROLL") || "";
  const hero = byTitle.get("HERO") || sections[0]?.body || "";
  const identification = byTitle.get("DOULEUR / IDENTIFICATION") || "";
  const benefits = byTitle.get("BENEFICES") || "";
  const mechanism = byTitle.get("MECANISME") || "";
  const proof = byTitle.get("PREUVE / RASSURANCE") || "";
  const objections = byTitle.get("OBJECTIONS") || "";
  const ctaFinal = byTitle.get("CTA FINAL") || "";
  const faq = byTitle.get("FAQ COURTE") || "";
  const priority = byTitle.get("A UTILISER EN PRIORITE") || "";

  const title =
    extractLeadValue(hero, ["TITRE", "TITLE"]) ||
    shortLines(hero, 1) ||
    shortLines(hook, 1) ||
    "Transforme ton audience en prospects qualifiés";
  const subtitle =
    extractLeadValue(hero, ["SOUS-TITRE", "SOUS TITRE", "SUBTITLE"]) ||
    shortLines(hero, 3) ||
    shortLines(identification, 2) ||
    "Une landing claire, premium et orientée conversion.";
  const cta =
    extractLeadValue(hero, ["CTA PRINCIPAL", "CTA"]) ||
    shortLines(ctaFinal, 1) ||
    shortLines(priority, 1) ||
    "Recevoir l’accès maintenant";

  const compactIdentification = shortLines(identification || hook, 4);
  const compactBenefits = shortLines(benefits, 5);
  const compactMechanism = shortLines(mechanism, 5);
  const compactProof = shortLines(proof, 4);
  const compactObjections = shortLines(objections, 5);
  const compactFaq = shortLines(faq, 6);

  const blockStyle = {
    fontFamily: "Inter",
    color: "#ffffff",
    fontWeight: 600,
    lineHeight: 1.28,
  };

  const labelStyle = {
    fontFamily: "Inter",
    color: "#ffb800",
    fontWeight: 900,
    lineHeight: 1.1,
  };

  const nextLayers: LayerData[] = [
    {
      id: `lead-ai-hero-title-${Date.now()}`,
      type: "text",
      x: 80,
      y: 80,
      width: 760,
      height: 170,
      visible: true,
      selected: false,
      zIndex: 10,
      text: title,
      style: {
        fontSize: 52,
        fontFamily: "Inter",
        color: "#ffffff",
        fontWeight: 900,
        lineHeight: 1.05,
      },
    } as LayerData,
    {
      id: `lead-ai-hero-subtitle-${Date.now()}`,
      type: "text",
      x: 84,
      y: 280,
      width: 720,
      height: 120,
      visible: true,
      selected: false,
      zIndex: 11,
      text: subtitle,
      style: {
        fontSize: 23,
        fontFamily: "Inter",
        color: "#e4e4e7",
        fontWeight: 500,
        lineHeight: 1.35,
      },
    } as LayerData,
    {
      id: `lead-ai-hero-cta-${Date.now()}`,
      type: "text",
      x: 84,
      y: 430,
      width: 380,
      height: 74,
      visible: true,
      selected: false,
      zIndex: 12,
      text: cta,
      style: {
        fontSize: 22,
        fontFamily: "Inter",
        color: "#111111",
        fontWeight: 900,
        lineHeight: 1.2,
        backgroundColor: "#ffb800",
      },
    } as LayerData,
    {
      id: `lead-ai-section-identification-title-${Date.now()}`,
      type: "text",
      x: 84,
      y: 590,
      width: 520,
      height: 48,
      visible: true,
      selected: false,
      zIndex: 13,
      text: "Pourquoi tu bloques",
      style: { ...labelStyle, fontSize: 30 },
    } as LayerData,
    {
      id: `lead-ai-section-identification-body-${Date.now()}`,
      type: "text",
      x: 84,
      y: 656,
      width: 790,
      height: 170,
      visible: true,
      selected: false,
      zIndex: 14,
      text:
        compactIdentification ||
        "Tu as déjà essayé plusieurs méthodes, mais aucune ne t’a donné une page claire pour capturer des emails.",
      style: { ...blockStyle, fontSize: 21 },
    } as LayerData,
    {
      id: `lead-ai-section-benefits-title-${Date.now()}`,
      type: "text",
      x: 84,
      y: 890,
      width: 360,
      height: 48,
      visible: true,
      selected: false,
      zIndex: 13,
      text: "Bénéfices clés",
      style: { ...labelStyle, fontSize: 32 },
    } as LayerData,
    {
      id: `lead-ai-section-benefits-body-${Date.now()}`,
      type: "text",
      x: 84,
      y: 960,
      width: 790,
      height: 220,
      visible: true,
      selected: false,
      zIndex: 14,
      text:
        compactBenefits ||
        "• Clarifie ta promesse.\n• Transforme l’attention en action.\n• Donne envie de s’inscrire maintenant.",
      style: { ...blockStyle, fontSize: 22 },
    } as LayerData,
    {
      id: `lead-ai-section-mechanism-title-${Date.now()}`,
      type: "text",
      x: 84,
      y: 1260,
      width: 420,
      height: 48,
      visible: true,
      selected: false,
      zIndex: 15,
      text: "Comment ça marche",
      style: { ...labelStyle, fontSize: 30 },
    } as LayerData,
    {
      id: `lead-ai-section-mechanism-body-${Date.now()}`,
      type: "text",
      x: 84,
      y: 1328,
      width: 790,
      height: 180,
      visible: true,
      selected: false,
      zIndex: 16,
      text:
        compactMechanism ||
        "Une méthode simple pour passer de l’idée à une page visible, claire et prête à convertir.",
      style: { ...blockStyle, fontSize: 21 },
    } as LayerData,
    {
      id: `lead-ai-section-proof-title-${Date.now()}`,
      type: "text",
      x: 84,
      y: 1840,
      width: 450,
      height: 48,
      visible: true,
      selected: false,
      zIndex: 17,
      text: "Preuve / réassurance",
      style: { ...labelStyle, fontSize: 30 },
    } as LayerData,
    {
      id: `lead-ai-section-proof-body-${Date.now()}`,
      type: "text",
      x: 84,
      y: 1908,
      width: 790,
      height: 150,
      visible: true,
      selected: false,
      zIndex: 18,
      text:
        compactProof ||
        "LGD t’aide à créer une page exploitable sans repartir de zéro ni dépendre d’un autre template.",
      style: { ...blockStyle, fontSize: 21 },
    } as LayerData,
    {
      id: `lead-ai-section-objections-title-${Date.now()}`,
      type: "text",
      x: 84,
      y: 1560,
      width: 380,
      height: 48,
      visible: true,
      selected: false,
      zIndex: 19,
      text: "Objections traitées",
      style: { ...labelStyle, fontSize: 30 },
    } as LayerData,
    {
      id: `lead-ai-section-objections-body-${Date.now()}`,
      type: "text",
      x: 84,
      y: 1628,
      width: 790,
      height: 210,
      visible: true,
      selected: false,
      zIndex: 20,
      text:
        compactObjections ||
        "• Je ne sais pas par où commencer.\n• Je n’ai pas le temps.\n• Je veux éviter une page amateur.",
      style: { ...blockStyle, fontSize: 20 },
    } as LayerData,
    {
      id: `lead-ai-section-faq-title-${Date.now()}`,
      type: "text",
      x: 84,
      y: 2180,
      width: 260,
      height: 48,
      visible: true,
      selected: false,
      zIndex: 21,
      text: "FAQ",
      style: { ...labelStyle, fontSize: 30 },
    } as LayerData,
    {
      id: `lead-ai-section-faq-body-${Date.now()}`,
      type: "text",
      x: 84,
      y: 2248,
      width: 790,
      height: 260,
      visible: true,
      selected: false,
      zIndex: 22,
      text:
        compactFaq ||
        `Q: À quoi sert LGD ?\nR: À transformer tes idées en contenus, pages et actions concrètes.\n\nQ: Est-ce adapté aux débutants ?\nR: Oui, la structure guide chaque étape.`,
      style: { ...blockStyle, fontSize: 19 },
    } as LayerData,
  ];

  return { layers: nextLayers, canvasHeight: 2650 };
}

function parseLinearGradient(input: string | undefined | null) {
  const raw = String(input || "").trim();
  const match = raw.match(
    /linear-gradient\(([-\d.]+)deg,\s*([^,]+),\s*([^\)]+)\)/i,
  );
  if (!match) return null;
  return {
    angle: Number(match[1] || 135),
    color1: String(match[2] || "#000000").trim(),
    color2: String(match[3] || "#000000").trim(),
  };
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function LeadEnginePage() {
  const [editorKey, setEditorKey] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [initialLayers, setInitialLayers] = useState<LayerData[]>(() =>
    buildLeadPreset(),
  );
  const [layers, setLayers] = useState<LayerData[]>(() => buildLeadPreset());
  const [ctaUrl, setCtaUrl] = useState(DEFAULT_CTA_URL);
  const [copied, setCopied] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState("");
  const [canvasHeight, setCanvasHeight] = useState(1800);
  const [archiveName, setArchiveName] = useState("");
  const [archives, setArchives] = useState<SavedArchive[]>([]);
  const [exporting, setExporting] = useState<"" | "png" | "jpeg">("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [aiBrief, setAiBrief] = useState("");
  const [aiGoal, setAiGoal] = useState<
    "landing_complete" | "hooks" | "cta" | "benefits" | "variants"
  >("landing_complete");
  const [aiLastGoal, setAiLastGoal] = useState<
    "landing_complete" | "hooks" | "cta" | "benefits" | "variants"
  >("landing_complete");
  const [aiQuota, setAiQuota] = useState<AIQuotaState>(DEFAULT_AI_QUOTA);
  const [aiQuotaLoading, setAiQuotaLoading] = useState(false);
  const [aiQuotaUnavailable, setAiQuotaUnavailable] = useState(false);
  const [aiQuotaMessage, setAiQuotaMessage] = useState("");
  const [premiumOpen, setPremiumOpen] = useState(true);
  const [cmoLoading, setCmoLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const aiResultSections = useMemo(() => {
    if (aiLastGoal !== "landing_complete") return [];
    const sections = parseLeadSections(aiResult);
    if (sections.length <= 1 && sections[0]?.title === "CONTENU LANDING")
      return [];

    return sections
      .filter((section) => section.body.trim().length > 0)
      .sort((a, b) => {
        const indexA = LEAD_SECTION_ORDER.indexOf(a.title);
        const indexB = LEAD_SECTION_ORDER.indexOf(b.title);
        const safeA = indexA === -1 ? 999 : indexA;
        const safeB = indexB === -1 ? 999 : indexB;
        return safeA - safeB;
      });
  }, [aiLastGoal, aiResult]);

  const aiQuotaKnown = !aiQuotaUnavailable && aiQuota.tokens_limit > 0;
  const canUseAI = !aiQuotaKnown || aiQuota.remaining > 0;
  const aiQuotaStatusLabel = aiQuotaLoading
    ? "Synchronisation quota IA..."
    : aiQuotaUnavailable
      ? "Quota IA : statut indisponible • génération autorisée"
      : aiQuotaKnown
        ? `Quota IA : ${aiQuota.remaining.toLocaleString()} / ${aiQuota.tokens_limit.toLocaleString()} • Plan ${aiQuota.plan}`
        : "Quota IA : synchronisation en cours • génération autorisée";

  function syncQuotaFromPayload(raw: any) {
    if (!raw || typeof raw !== "object") return;
    setAiQuota({
      plan: String(raw.plan || aiQuota.plan || "essentiel"),
      remaining: Math.max(0, Number(raw.remaining ?? 0) || 0),
      tokens_used: Math.max(0, Number(raw.tokens_used ?? 0) || 0),
      tokens_limit: Math.max(0, Number(raw.tokens_limit ?? 0) || 0),
    });
  }

  async function refreshAIQuota() {
    const apiBaseUrl = String(process.env.NEXT_PUBLIC_API_URL || "").replace(
      /\/$/,
      "",
    );

    if (!apiBaseUrl) {
      setAiQuotaUnavailable(true);
      setAiQuotaLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);

    try {
      setAiQuotaLoading(true);
      const response = await fetch(`${apiBaseUrl}/ai-quota/global`, {
        method: "GET",
        credentials: "include",
        headers: getAuthHeaders(),
        signal: controller.signal,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setAiQuotaUnavailable(true);
        return;
      }

      setAiQuotaUnavailable(false);
      syncQuotaFromPayload(data);
    } catch (error) {
      console.error("[LeadEngine quota]", error);
      setAiQuotaUnavailable(true);
    } finally {
      window.clearTimeout(timeout);
      setAiQuotaLoading(false);
    }
  }

  function handleQuotaExceeded(data: any) {
    const detail = data?.detail;
    const quota = detail?.quota || data?.quota;
    if (quota) syncQuotaFromPayload(quota);
    const message =
      detail?.message || data?.message || "Quota IA atteint pour le moment.";
    setAiQuotaMessage(String(message));
    window.alert(String(message));
  }

  function extractAIContent(data: any): string {
    const direct = String(
      data?.content ||
        data?.result ||
        data?.text ||
        data?.message ||
        data?.output ||
        "",
    ).trim();

    if (direct) return direct;

    const blocks = Array.isArray(data?.blocks)
      ? data.blocks
      : Array.isArray(data?.sections)
        ? data.sections
        : Array.isArray(data?.landing_blocks)
          ? data.landing_blocks
          : [];

    if (!blocks.length) return "";

    return blocks
      .map((block: any, index: number) => {
        if (typeof block === "string") return block.trim();

        const title = String(
          block?.title || block?.heading || block?.name || `BLOC ${index + 1}`,
        ).trim();
        const body = String(
          block?.body ||
            block?.content ||
            block?.text ||
            block?.description ||
            "",
        ).trim();

        if (!body) return title;
        return `${title}\n${body}`.trim();
      })
      .filter(Boolean)
      .join("\n\n");
  }

  function handleCtaUrlChange(nextValue: string) {
    const normalized = normalizeExportUrl(nextValue);
    setCtaUrl(normalized);
    try {
      window.localStorage.setItem(STORAGE_CTA_KEY, normalized);
    } catch {
      // noop
    }
  }

  useEffect(() => {
    try {
      const savedLayers = safeParseLayers(
        window.localStorage.getItem(STORAGE_KEY),
      );
      const savedCta =
        window.localStorage.getItem(STORAGE_CTA_KEY) || DEFAULT_CTA_URL;
      const savedCanvasHeight = safeParseHeight(
        window.localStorage.getItem(STORAGE_CANVAS_HEIGHT_KEY),
      );
      const savedArchives = safeParseArchives(
        window.localStorage.getItem(STORAGE_ARCHIVES_KEY),
      );

      const cmoRawPayload = window.localStorage.getItem(
        CMO_MODULE_AUTO_PAYLOAD_KEY,
      );
      const cmoPayload = cmoRawPayload ? JSON.parse(cmoRawPayload) : null;

      if (isLeadEngineCmoPayload(cmoPayload)) {
        const cmoLayers = buildLeadPresetFromCmo(cmoPayload);
        const cmoBrief = buildCmoLeadBrief(cmoPayload);
        const cmoCtaUrl = normalizeExportUrl(
          pickCmoString(
            cmoPayload,
            ["cta_url", "ctaUrl", "url", "link"],
            savedCta || DEFAULT_CTA_URL,
          ),
        );

        setCmoLoading(true);
        setInitialLayers(cmoLayers);
        setLayers(cmoLayers);
        setCtaUrl(cmoCtaUrl);
        setCanvasHeight(savedCanvasHeight ?? 1800);
        setArchives(savedArchives);
        setAiBrief(cmoBrief);
        setAiGoal("landing_complete");
        setAiLastGoal("landing_complete");
        setArchiveName("Landing CMO IA");
        setEditorKey((value) => value + 1);

        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cmoLayers));
        window.localStorage.setItem(STORAGE_CTA_KEY, cmoCtaUrl);
        window.localStorage.removeItem(CMO_MODULE_AUTO_PAYLOAD_KEY);

        window.setTimeout(() => setCmoLoading(false), 900);
        return;
      }

      const nextLayers =
        savedLayers && savedLayers.length > 0 ? savedLayers : buildLeadPreset();

      setInitialLayers(nextLayers);
      setLayers(nextLayers);
      setCtaUrl(normalizeExportUrl(savedCta));
      setCanvasHeight(savedCanvasHeight ?? 1800);
      setArchives(savedArchives);
    } catch {
      const preset = buildLeadPreset();
      setInitialLayers(preset);
      setLayers(preset);
      setCtaUrl(DEFAULT_CTA_URL);
      setCanvasHeight(1800);
      setArchives([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void refreshAIQuota();
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_CTA_KEY, normalizeExportUrl(ctaUrl));
      window.localStorage.setItem(
        STORAGE_CANVAS_HEIGHT_KEY,
        String(canvasHeight),
      );
      window.localStorage.setItem(
        STORAGE_ARCHIVES_KEY,
        JSON.stringify(archives),
      );
    } catch {
      // noop
    }
  }, [ctaUrl, canvasHeight, archives, hydrated]);

  async function autoSaveMemory(content: string) {
    const trimmed = String(content || "").trim();
    if (!trimmed) return;

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/lead-engine/ai/save-memory`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            memory_type: "lead_brief",
            content: trimmed,
            emotional_profile: "human premium",
            business_context: "lead-engine",
          }),
        },
      );
    } catch (error) {
      console.error("[LeadEngine memory]", error);
    }
  }

  useEffect(() => {
    if (!aiBrief.trim()) return;

    const timer = window.setTimeout(() => {
      void autoSaveMemory(aiBrief);
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [aiBrief]);

  async function generateWithAI(goal: string, forcedBrief?: string) {
    try {
      setAiLoading(true);
      setAiLastGoal(goal as typeof aiLastGoal);
      setAiResult("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/lead-engine/ai/generate`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            goal,
            brief:
              forcedBrief ||
              aiBrief ||
              "Créer une landing premium orientée conversion.",
            emotional_style:
              goal === "rewrite_landing"
                ? "réécriture courte, claire, landing, sans pavé"
                : "humain, authentique, expert, sincère, orienté conversion",
            business_context: `lead generation premium | cta_url=${normalizeExportUrl(ctaUrl)}`,
          }),
        },
      );

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const detail = (data as any)?.detail;
        const isQuotaError =
          response.status === 402 ||
          response.status === 429 ||
          String(detail || "")
            .toLowerCase()
            .includes("quota");

        if (isQuotaError) {
          handleQuotaExceeded(data);
          return;
        }

        throw new Error(typeof detail === "string" ? detail : "Erreur IA");
      }

      const content = extractAIContent(data);
      setAiQuotaMessage("");
      if ((data as any)?.quota) syncQuotaFromPayload((data as any).quota);
      setAiResult(content);
    } catch (error) {
      console.error("[LeadEngine AI]", error);
      window.alert("Génération IA impossible pour le moment.");
    } finally {
      setAiLoading(false);
    }
  }

  function rewritePremiumResult() {
    const source = aiResult.trim() || aiBrief.trim();
    if (!source) return;
    void generateWithAI("rewrite_landing", source);
  }

  function clearPremiumResult() {
    setAiResult("");
  }

  function injectStructuredLanding() {
    const source = aiResult.trim();
    if (!source) return;

    const structured = buildStructuredLandingLayers(
      source,
      normalizeExportUrl(ctaUrl),
    );
    if (!structured) return;

    setLayers(structured.layers);
    setInitialLayers(structured.layers);
    setCanvasHeight(structured.canvasHeight);
    setEditorKey((value) => value + 1);
    setLastSavedAt(new Date().toLocaleTimeString());
    persistLayers(structured.layers);

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(structured.layers),
      );
      window.localStorage.setItem(
        STORAGE_CANVAS_HEIGHT_KEY,
        String(structured.canvasHeight),
      );
      window.localStorage.setItem(STORAGE_CTA_KEY, normalizeExportUrl(ctaUrl));
    } catch {
      // noop
    }
  }

  function injectSingleAiSection(section: LeadSection, index: number) {
    const cleanTitle = section.title.trim() || `BLOC ${index + 1}`;
    const cleanBody = cleanLeadBody(section.body);
    if (!cleanBody) return;

    const normalizedSnapshot = normalizeLayersSnapshot(layers);
    const titleHeight = estimateLeadTextHeight(cleanTitle, 760, 30, 1.1);
    const bodyHeight = estimateLeadTextHeight(cleanBody, 820, 22, 1.32);
    const gapAfterTitle = 24;
    const gapAfterBlock = 88;
    const insertionHeight = Math.max(
      280,
      titleHeight + gapAfterTitle + bodyHeight + gapAfterBlock,
    );

    const aiBlocks = normalizedSnapshot.filter((layer: any) =>
      String(layer?.id || "").startsWith("lead-ai-block-"),
    );
    const aiBottom = aiBlocks.reduce((max, layer: any) => {
      const y = typeof layer?.y === "number" ? layer.y : 0;
      const height = typeof layer?.height === "number" ? layer.height : 0;
      return Math.max(max, y + height);
    }, 0);

    const insertionY = aiBottom > 0 ? aiBottom + 72 : 80;
    const stamp = Date.now();
    const shiftedLayers = normalizedSnapshot.map((layer: any) => {
      const y = typeof layer?.y === "number" ? layer.y : 0;
      const isAiBlock = String(layer?.id || "").startsWith("lead-ai-block-");
      const mustShift = aiBottom > 0 ? !isAiBlock && y >= insertionY : true;
      return {
        ...layer,
        y: mustShift && typeof layer?.y === "number" ? layer.y + insertionHeight : layer?.y,
      };
    }) as LayerData[];

    const newSectionLayers: LayerData[] = [
      {
        id: `lead-ai-block-title-${stamp}-${index}`,
        type: "text",
        x: 84,
        y: insertionY,
        width: 760,
        height: titleHeight,
        visible: true,
        selected: false,
        zIndex: 2000 + index * 2,
        text: cleanTitle,
        style: {
          fontSize: 30,
          fontFamily: "Inter",
          color: "#ffb800",
          fontWeight: 900,
          lineHeight: 1.1,
        },
      } as LayerData,
      {
        id: `lead-ai-block-body-${stamp}-${index}`,
        type: "text",
        x: 84,
        y: insertionY + titleHeight + gapAfterTitle,
        width: 820,
        height: bodyHeight,
        visible: true,
        selected: false,
        zIndex: 2001 + index * 2,
        text: cleanBody,
        style: {
          fontSize: 22,
          fontFamily: "Inter",
          color: "#ffffff",
          fontWeight: 600,
          lineHeight: 1.32,
        },
      } as LayerData,
    ];

    const nextLayers = [...shiftedLayers, ...newSectionLayers].sort((a: any, b: any) => {
      const zA = typeof a?.zIndex === "number" ? a.zIndex : 0;
      const zB = typeof b?.zIndex === "number" ? b.zIndex : 0;
      return zA - zB;
    }) as LayerData[];

    const nextHeight = Math.max(
      canvasHeight + insertionHeight,
      insertionY + insertionHeight + 320,
    );

    setLayers(nextLayers);
    setInitialLayers(nextLayers);
    setCanvasHeight(nextHeight);
    setEditorKey((value) => value + 1);
    setLastSavedAt(new Date().toLocaleTimeString());
    persistLayers(nextLayers);

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextLayers));
      window.localStorage.setItem(
        STORAGE_CANVAS_HEIGHT_KEY,
        String(nextHeight),
      );
    } catch {
      // noop
    }
  }

  const htmlExport = useMemo(() => {
    return buildLeadHtmlExport({
      layers,
      ctaUrl: normalizeExportUrl(ctaUrl),
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

  function persistLayers(nextLayers: LayerData[]) {
    const snapshot = normalizeLayersSnapshot(nextLayers);
    if (snapshot.length === 0) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // noop
    }
  }

  function handleLayersChange(nextLayers: LayerData[]) {
    const snapshot = normalizeLayersSnapshot(nextLayers);
    if (snapshot.length === 0) return;

    setLayers(snapshot);
    setInitialLayers(snapshot);
    setLastSavedAt(new Date().toLocaleTimeString());
    persistLayers(snapshot);
  }

  function resetPreset() {
    const preset = buildLeadPreset();
    setInitialLayers(preset);
    setLayers(preset);
    setCanvasHeight(1800);
    setEditorKey((value) => value + 1);
    setLastSavedAt(new Date().toLocaleTimeString());

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preset));
      window.localStorage.setItem(STORAGE_CANVAS_HEIGHT_KEY, "1800");
      window.localStorage.setItem(STORAGE_CTA_KEY, DEFAULT_CTA_URL);
    } catch {
      // noop
    }

    setCtaUrl(DEFAULT_CTA_URL);
  }

  function handleCanvasHeightChange(nextHeight: number) {
    const safeHeight = Math.max(1200, Math.min(5000, Math.round(nextHeight)));
    setCanvasHeight(safeHeight);
    setLastSavedAt(new Date().toLocaleTimeString());

    try {
      window.localStorage.setItem(
        STORAGE_CANVAS_HEIGHT_KEY,
        String(safeHeight),
      );
    } catch {
      // noop
    }
  }

  function saveArchive() {
    const snapshot = normalizeLayersSnapshot(layers);
    if (snapshot.length === 0) return;

    const name =
      archiveName.trim() ||
      `Archive ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;

    const next: SavedArchive = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      name,
      createdAt: new Date().toISOString(),
      layers: snapshot,
      ctaUrl: normalizeExportUrl(ctaUrl),
      canvasHeight,
    };

    setArchives((prev) => [next, ...prev].slice(0, 30));
    setArchiveName("");
  }

  function loadArchive(archiveId: string) {
    const found = archives.find((item) => item.id === archiveId);
    if (!found) return;

    const snapshot = normalizeLayersSnapshot(found.layers);
    if (snapshot.length === 0) return;

    setInitialLayers(snapshot);
    setLayers(snapshot);
    setCtaUrl(normalizeExportUrl(found.ctaUrl || DEFAULT_CTA_URL));
    setCanvasHeight(found.canvasHeight);
    setEditorKey((value) => value + 1);
    setLastSavedAt(new Date().toLocaleTimeString());

    persistLayers(snapshot);

    try {
      window.localStorage.setItem(
        STORAGE_CANVAS_HEIGHT_KEY,
        String(found.canvasHeight),
      );
      window.localStorage.setItem(
        STORAGE_CTA_KEY,
        normalizeExportUrl(found.ctaUrl || DEFAULT_CTA_URL),
      );
    } catch {
      // noop
    }
  }

  function deleteArchive(archiveId: string) {
    setArchives((prev) => prev.filter((item) => item.id !== archiveId));
  }

  async function exportRaster(type: "png" | "jpeg") {
    const visibleLayers = normalizeLayersSnapshot(layers).filter(
      (layer: any) =>
        layer &&
        layer.visible !== false &&
        String(layer.id) !== "lead-canvas-height-marker",
    );

    if (visibleLayers.length === 0) {
      window.alert("Export impossible : aucun layer visible.");
      return;
    }

    try {
      setExporting(type);

      const canvas = document.createElement("canvas");
      canvas.width = EXPORT_CANVAS_WIDTH;
      canvas.height = Math.max(1200, Math.round(canvasHeight || 1800));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas 2D indisponible.");

      const loadImage = (src: string) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.decoding = "async";
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error("Chargement image impossible."));
          img.src = src;
        });

      const drawCover = (
        img: HTMLImageElement,
        dx: number,
        dy: number,
        dw: number,
        dh: number,
      ) => {
        const scale = Math.max(dw / img.width, dh / img.height);
        const sw = dw / scale;
        const sh = dh / scale;
        const sx = (img.width - sw) / 2;
        const sy = (img.height - sh) / 2;
        ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
      };

      const drawContain = (
        img: HTMLImageElement,
        dx: number,
        dy: number,
        dw: number,
        dh: number,
      ) => {
        const scale = Math.min(dw / img.width, dh / img.height);
        const rw = img.width * scale;
        const rh = img.height * scale;
        const ox = dx + (dw - rw) / 2;
        const oy = dy + (dh - rh) / 2;
        ctx.drawImage(img, ox, oy, rw, rh);
      };

      const drawRoundedRect = (
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number,
        fill: string,
      ) => {
        const r = Math.min(radius, width / 2, height / 2);
        ctx.save();
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + width - r, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + r);
        ctx.lineTo(x + width, y + height - r);
        ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
        ctx.lineTo(x + r, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      };

      const drawTextLayer = (layer: any) => {
        const style = getLayerStyle(layer);
        const fontSize = Math.max(8, toNumber(style.fontSize, 32));
        const fontWeight = String(style.fontWeight ?? 400);
        const fontFamily = String(
          style.fontFamily || "Inter, Arial, sans-serif",
        );
        const lineHeight = Math.max(0.8, toNumber(style.lineHeight, 1.2));
        const textAlign = ["left", "center", "right", "justify"].includes(
          String(style.textAlign),
        )
          ? String(style.textAlign)
          : "left";
        const color = getTextColor(style);
        const backgroundColor = style.backgroundColor
          ? String(style.backgroundColor)
          : "";
        const x = Math.round(toNumber(layer.x, 0));
        const y = Math.round(toNumber(layer.y, 0));
        const width = Math.max(20, Math.round(toNumber(layer.width, 320)));
        const minHeight = Math.max(20, Math.round(toNumber(layer.height, 60)));
        const paddingX = backgroundColor ? 22 : 0;
        const paddingY = backgroundColor ? 16 : 0;
        const innerWidth = Math.max(20, width - paddingX * 2);
        const rawText = String(layer.text || "");

        ctx.save();
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.textBaseline = "top";

        const lines: string[] = [];
        for (const paragraph of rawText.split("\n")) {
          const words = String(paragraph || "")
            .split(/\s+/)
            .filter(Boolean);
          if (!words.length) {
            lines.push("");
            continue;
          }

          let current = "";
          for (const word of words) {
            const test = current ? `${current} ${word}` : word;
            if (ctx.measureText(test).width <= innerWidth || !current) {
              current = test;
            } else {
              lines.push(current);
              current = word;
            }
          }

          if (current) lines.push(current);
        }

        const boxHeight = Math.max(
          minHeight,
          Math.ceil(lines.length * fontSize * lineHeight + paddingY * 2),
        );
        if (backgroundColor) {
          drawRoundedRect(x, y, width, boxHeight, 18, backgroundColor);
        }

        ctx.fillStyle = color;
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.textAlign = textAlign as CanvasTextAlign;

        let textX = x + paddingX;
        if (textAlign === "center") textX = x + width / 2;
        if (textAlign === "right") textX = x + width - paddingX;

        let cursorY = y + paddingY;
        for (const line of lines) {
          ctx.fillText(line, textX, cursorY);
          cursorY += fontSize * lineHeight;
        }

        ctx.restore();
      };

      if (type === "jpeg") {
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const backgroundLayer =
        visibleLayers.find(
          (layer: any) => String(layer.id) === "background-post",
        ) ?? null;
      const bgStyle = getLayerStyle(backgroundLayer);
      const bgColor = String(bgStyle.color || "#111111");
      const bgGradient = parseLinearGradient(bgColor);

      if (bgGradient) {
        const angle = ((bgGradient.angle - 90) * Math.PI) / 180;
        const x0 = canvas.width / 2 - (Math.cos(angle) * canvas.width) / 2;
        const y0 = canvas.height / 2 - (Math.sin(angle) * canvas.height) / 2;
        const x1 = canvas.width / 2 + (Math.cos(angle) * canvas.width) / 2;
        const y1 = canvas.height / 2 + (Math.sin(angle) * canvas.height) / 2;
        const grd = ctx.createLinearGradient(x0, y0, x1, y1);
        grd.addColorStop(0, bgGradient.color1);
        grd.addColorStop(1, bgGradient.color2);
        ctx.fillStyle = grd;
      } else {
        ctx.fillStyle = bgColor;
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (
        backgroundLayer &&
        backgroundLayer.type === "image" &&
        typeof backgroundLayer.src === "string" &&
        backgroundLayer.src
      ) {
        const bgImg = await loadImage(backgroundLayer.src);
        drawCover(bgImg, 0, 0, canvas.width, canvas.height);
      }

      const overlay = (bgStyle as any).overlay;
      if (overlay) {
        ctx.save();
        ctx.globalAlpha = clamp(Number(overlay.opacity ?? 0.35), 0, 1);
        const overlayValue = String(
          overlay.value || overlay.color1 || "#000000",
        );
        const overlayGradient = parseLinearGradient(overlayValue);
        if (overlayGradient) {
          const angle = ((overlayGradient.angle - 90) * Math.PI) / 180;
          const x0 = canvas.width / 2 - (Math.cos(angle) * canvas.width) / 2;
          const y0 = canvas.height / 2 - (Math.sin(angle) * canvas.height) / 2;
          const x1 = canvas.width / 2 + (Math.cos(angle) * canvas.width) / 2;
          const y1 = canvas.height / 2 + (Math.sin(angle) * canvas.height) / 2;
          const grd = ctx.createLinearGradient(x0, y0, x1, y1);
          grd.addColorStop(0, overlayGradient.color1);
          grd.addColorStop(1, overlayGradient.color2);
          ctx.fillStyle = grd;
        } else {
          ctx.fillStyle = overlayValue;
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      const contentLayers = [...visibleLayers]
        .filter((layer: any) => String(layer.id) !== "background-post")
        .sort(
          (a: any, b: any) => Number(a?.zIndex ?? 0) - Number(b?.zIndex ?? 0),
        );

      for (const layer of contentLayers as any[]) {
        if (
          layer.type === "image" &&
          typeof layer.src === "string" &&
          layer.src
        ) {
          const img = await loadImage(layer.src);
          drawContain(
            img,
            Math.round(toNumber(layer.x, 0)),
            Math.round(toNumber(layer.y, 0)),
            Math.max(20, Math.round(toNumber(layer.width, 300))),
            Math.max(20, Math.round(toNumber(layer.height, 300))),
          );
          continue;
        }

        if (layer.type === "text") {
          drawTextLayer(layer);
        }
      }

      const dataUrl = canvas.toDataURL(
        type === "png" ? "image/png" : "image/jpeg",
        0.95,
      );
      const filename = `lgd-lead-engine-${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, "-")}.${type === "png" ? "png" : "jpg"}`;
      downloadDataUrl(dataUrl, filename);
    } catch (error) {
      console.error("[LeadEngine exportRaster]", error);
      window.alert(
        type === "png"
          ? "Export PNG impossible pour le moment."
          : "Export JPEG impossible pour le moment.",
      );
    } finally {
      setExporting("");
    }
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
                Lead Builder V4.7.3 — IA Premium First
              </div>
            </div>

            <h1 className="text-3xl font-extrabold text-[#ffb800] sm:text-4xl">
              Lead Engine branché sur la vraie structure éditeur
            </h1>
            <p className="mt-2 max-w-3xl text-white/65">
              Export HTML SIO, export PNG / JPEG, archives locales et copilote
              IA mémoire branché sur le backend.
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
              onClick={() => exportRaster("png")}
              disabled={!!exporting}
              className="inline-flex items-center gap-2 rounded-2xl border border-yellow-600/25 bg-[#0b0b0b] px-5 py-3 font-semibold text-white/85 disabled:opacity-50"
            >
              <FaImage className="text-yellow-300" />
              {exporting === "png" ? "Export PNG..." : "Exporter PNG"}
            </button>

            <button
              type="button"
              onClick={() => exportRaster("jpeg")}
              disabled={!!exporting}
              className="inline-flex items-center gap-2 rounded-2xl border border-yellow-600/25 bg-[#0b0b0b] px-5 py-3 font-semibold text-white/85 disabled:opacity-50"
            >
              <FaDownload className="text-yellow-300" />
              {exporting === "jpeg" ? "Export JPEG..." : "Exporter JPEG"}
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

        {cmoLoading && (
          <div className="mb-6 rounded-[28px] border border-yellow-500/25 bg-gradient-to-r from-yellow-500/10 via-[#0b0b0b] to-yellow-500/10 p-5 text-center shadow-[0_0_35px_rgba(255,184,0,0.08)]">
            <div className="inline-flex items-center justify-center gap-3 rounded-full border border-yellow-500/25 bg-black/25 px-5 py-3 text-sm font-semibold text-yellow-200">
              <FaMagic className="animate-pulse text-yellow-300" />
              Le CMO IA construit ta landing et prépare ton funnel de
              conversion…
            </div>
          </div>
        )}

        <div className="mb-10 rounded-[28px] border border-yellow-500/30 bg-[#0b0b0b] p-5 shadow-[0_0_38px_rgba(255,184,0,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-yellow-300">
                IA Lead Engine Premium
              </div>
              <div className="mt-1 text-sm text-white/55">
                Bloc prioritaire placé en haut de page : génère, vérifie, puis
                injecte la landing structurée dans l’éditeur en dessous.
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl border border-yellow-600/20 bg-black/30 px-3 py-2 text-xs text-white/75">
                {aiQuotaStatusLabel}
              </div>

              <button
                type="button"
                onClick={() => setPremiumOpen((value) => !value)}
                className="rounded-2xl border border-yellow-600/20 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-200"
              >
                {premiumOpen ? "Réduire" : "Déplier"}
              </button>
            </div>
          </div>

          {premiumOpen && (
            <div className="mt-4 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-2xl border border-yellow-600/20 bg-[#111] p-4">
                <select
                  value={aiGoal}
                  onChange={(e) => setAiGoal(e.target.value as typeof aiGoal)}
                  className="rounded-xl border border-yellow-600/20 bg-black/30 px-3 py-2 text-sm text-white outline-none"
                >
                  <option value="landing_complete">Landing complète</option>
                  <option value="hooks">Hooks</option>
                  <option value="cta">CTA</option>
                  <option value="benefits">Bénéfices</option>
                  <option value="variants">Variantes A/B</option>
                </select>

                <textarea
                  value={aiBrief}
                  onChange={(e) => setAiBrief(e.target.value)}
                  placeholder="Décris précisément l'offre, la cible, la transformation promise, les douleurs, le niveau d'émotion souhaité, le ton et le résultat attendu..."
                  className="mt-4 min-h-[180px] w-full rounded-2xl border border-yellow-600/20 bg-black/30 p-4 text-white outline-none placeholder:text-white/30"
                />

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => generateWithAI(aiGoal)}
                    disabled={aiLoading}
                    className="rounded-2xl bg-[#ffb800] px-5 py-3 font-bold text-black disabled:opacity-60"
                  >
                    {aiLoading ? "Génération..." : "Générer avec IA"}
                  </button>

                  <button
                    type="button"
                    onClick={rewritePremiumResult}
                    disabled={
                      aiLoading || (!aiResult.trim() && !aiBrief.trim())
                    }
                    className="rounded-2xl border border-yellow-600/20 bg-yellow-500/10 px-5 py-3 font-semibold text-yellow-200 disabled:opacity-50"
                  >
                    Réécrire court
                  </button>

                  <button
                    type="button"
                    onClick={clearPremiumResult}
                    disabled={aiLoading || !aiResult.trim()}
                    className="rounded-2xl border border-yellow-600/20 bg-black/30 px-5 py-3 font-semibold text-white/80 disabled:opacity-50"
                  >
                    Effacer le résultat
                  </button>

                  <button
                    type="button"
                    onClick={injectStructuredLanding}
                    disabled={aiLoading || !aiResult.trim()}
                    className="rounded-2xl border border-yellow-500/40 bg-[#ffb800] px-5 py-3 font-bold text-black disabled:opacity-50"
                  >
                    Structurer en blocs
                  </button>

                  <div className="text-xs text-white/45">
                    {!canUseAI
                      ? aiQuotaMessage ||
                        "Quota IA atteint côté backend • la génération sera refusée proprement"
                      : aiQuotaUnavailable
                        ? "Statut quota indisponible • l’IA reste autorisée, le backend vérifiera le quota"
                        : "Mémoire automatique active • Backend OpenAI branché • IA-quotas reliés"}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-yellow-600/20 bg-[#111] p-4">
                <div className="text-sm font-semibold text-yellow-300">
                  Résultat IA
                </div>
                <div className="mt-1 text-sm text-white/55">
                  Sortie humanisée, contextualisée et prête à être réinjectée
                  dans le Lead Engine.
                </div>

                {aiLoading ? (
                  <div className="mt-4 min-h-[260px] w-full rounded-2xl border border-yellow-600/20 bg-black/30 p-4 flex flex-col items-center justify-center text-white/70">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent" />
                    <div className="mt-4 text-sm font-medium text-yellow-200">
                      Analyse en cours...
                    </div>
                    <div className="mt-2 text-xs text-white/40">
                      LGD prépare une réponse premium.
                    </div>
                  </div>
                ) : aiResultSections.length > 0 ? (
                  <div className="mt-4 max-h-[520px] space-y-3 overflow-y-auto pr-1">
                    {aiResultSections.map((section, index) => (
                      <div
                        key={`${section.title}-${index}`}
                        className="rounded-2xl border border-yellow-600/20 bg-black/30 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-300">
                              Bloc {index + 1}
                            </div>
                            <div className="mt-1 text-sm font-semibold text-white">
                              {section.title}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              injectSingleAiSection(section, index)
                            }
                            className="shrink-0 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs font-semibold text-yellow-200 hover:bg-yellow-500/15"
                          >
                            Injecter ce bloc
                          </button>
                        </div>

                        <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-yellow-600/10 bg-[#050505] p-3 text-sm leading-relaxed text-white/85">
                          {section.body}
                        </pre>
                      </div>
                    ))}
                  </div>
                ) : (
                  <textarea
                    readOnly
                    value={aiResult}
                    placeholder="Les résultats IA apparaîtront ici. Ils seront nourris par le brief, le contexte métier et la mémoire utilisateur."
                    className="mt-4 min-h-[260px] w-full rounded-2xl border border-yellow-600/20 bg-black/30 p-4 text-white/90 outline-none placeholder:text-white/25"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mb-8 rounded-[28px] border border-yellow-600/20 bg-[#0b0b0b] p-5">
          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <div>
              <div className="mb-2 text-sm font-semibold text-yellow-300">
                Archive de landing
              </div>
              <div className="text-sm text-white/55">
                Sauvegarde des versions prêtes à rouvrir, dupliquer ou exporter
                plus tard.
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={archiveName}
                  onChange={(e) => setArchiveName(e.target.value)}
                  placeholder="Nom de l’archive"
                  className="flex-1 rounded-2xl border border-yellow-600/20 bg-[#111] px-4 py-4 text-sm text-white/85 outline-none placeholder:text-white/30"
                />
                <button
                  type="button"
                  onClick={saveArchive}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#ffb800] px-5 py-3 font-semibold text-black"
                >
                  <FaSave />
                  Archiver
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-yellow-600/20 bg-[#111] p-4">
              <div className="text-sm font-semibold text-yellow-300">
                Archives récentes
              </div>

              <div className="mt-3 max-h-[180px] space-y-2 overflow-y-auto pr-1">
                {archives.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-yellow-600/20 bg-black/20 px-4 py-4 text-sm text-white/45">
                    Aucune archive pour le moment.
                  </div>
                ) : (
                  archives.map((archive) => (
                    <div
                      key={archive.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-yellow-600/15 bg-black/20 px-3 py-3"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-white/85">
                          {archive.name}
                        </div>
                        <div className="text-[12px] text-white/45">
                          {new Date(archive.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => loadArchive(archive.id)}
                          className="rounded-lg border border-yellow-600/20 bg-yellow-500/10 px-3 py-2 text-xs font-semibold text-yellow-200"
                        >
                          Charger
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteArchive(archive.id)}
                          className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          ref={rootRef}
          className="rounded-[28px] border border-yellow-600/20 bg-[#0b0b0b] p-4 sm:p-5"
        >
          {hydrated ? (
            <LeadEditorLayout
              key={editorKey}
              initialLayers={initialLayers}
              initialLayersKey={`lead-engine-${editorKey}`}
              canvasHeight={canvasHeight}
              onCanvasHeightChange={handleCanvasHeightChange}
              ctaUrl={ctaUrl}
              onCtaUrlChange={handleCtaUrlChange}
              onChange={handleLayersChange}
              aiQuotaRemaining={aiQuota.remaining}
              aiQuotaLimit={aiQuota.tokens_limit}
              aiQuotaPlan={aiQuota.plan}
              aiQuotaLoading={aiQuotaLoading}
              onAiQuotaSync={syncQuotaFromPayload}
            />
          ) : (
            <div className="flex min-h-[680px] items-center justify-center rounded-[20px] border border-yellow-600/15 bg-[#090909] text-sm text-white/45">
              Chargement du lead builder...
            </div>
          )}
        </div>

        {!!lastSavedAt && (
          <div className="mt-4 text-right text-xs text-white/35">
            Dernière synchro : {lastSavedAt}
          </div>
        )}
      </div>
    </div>
  );
}
