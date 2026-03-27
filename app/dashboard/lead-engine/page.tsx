"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FaArrowLeft, FaCopy, FaMagic, FaRedo } from "react-icons/fa";

import type { LayerData } from "@/dashboard/automatisations/reseaux_sociaux/carrousel/editor/v5/types/layers";
import LeadEditorLayout from "@/dashboard/automatisations/reseaux_sociaux/carrousel/editor/v5/ui/LeadEditorLayout";

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

function getText(layer: any) {
  return typeof layer?.text === "string" ? layer.text : "";
}

function buildHtmlExport(layers: LayerData[]) {
  const visible = [...layers]
    .filter((layer: any) => layer?.visible !== false)
    .sort((a: any, b: any) => Number(a?.y ?? 0) - Number(b?.y ?? 0));

  const title =
    getText(visible.find((l: any) => String(l.id).includes("lead-title"))) ||
    "Titre du lead";
  const subtitle =
    getText(visible.find((l: any) => String(l.id).includes("lead-subtitle"))) ||
    "Sous-titre du lead";
  const cta =
    getText(visible.find((l: any) => String(l.id).includes("lead-cta"))) ||
    "Recevoir le lead";

  const imageLayer = visible.find(
    (l: any) => l?.type === "image" && typeof l?.src === "string"
  );
  const imageSrc = imageLayer?.src || "";

  const benefitTexts = visible
    .filter((l: any) => String(l.id).includes("lead-benefit-"))
    .map((l: any) => getText(l))
    .filter(Boolean);

  const proofTitle =
    getText(visible.find((l: any) => String(l.id).includes("lead-proof-title"))) ||
    "Preuve sociale";
  const proofBody =
    getText(visible.find((l: any) => String(l.id).includes("lead-proof-body"))) || "";

  const faqTitle =
    getText(visible.find((l: any) => String(l.id).includes("lead-faq-title"))) ||
    "FAQ";

  const faqPairs = [
    {
      q: getText(visible.find((l: any) => String(l.id).includes("lead-faq-q1"))),
      a: getText(visible.find((l: any) => String(l.id).includes("lead-faq-a1"))),
    },
    {
      q: getText(visible.find((l: any) => String(l.id).includes("lead-faq-q2"))),
      a: getText(visible.find((l: any) => String(l.id).includes("lead-faq-a2"))),
    },
  ].filter((item) => item.q || item.a);

  const benefitsHtml = benefitTexts
    .map(
      (text) =>
        `<div style="padding:18px;border:1px solid rgba(255,184,0,0.18);border-radius:18px;background:#111111;color:#ffffff;font-size:18px;line-height:1.7;">${text}</div>`
    )
    .join("");

  const faqHtml = faqPairs
    .map(
      (item) => `
        <div style="padding:18px;border:1px solid rgba(255,184,0,0.18);border-radius:18px;background:#111111;">
          <div style="font-size:20px;font-weight:800;color:#ffffff;">${item.q}</div>
          <div style="margin-top:10px;font-size:17px;line-height:1.7;color:#d4d4d8;">${item.a}</div>
        </div>
      `
    )
    .join("");

  return `
<div style="max-width:1200px;margin:0 auto;background:linear-gradient(180deg,#120d02,#050505);color:#ffffff;font-family:Inter,Arial,sans-serif;border:1px solid rgba(255,184,0,0.18);border-radius:32px;overflow:hidden;">
  <section style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:0;border-bottom:1px solid rgba(255,184,0,0.14);">
    <div style="padding:56px;">
      <div style="display:inline-block;padding:8px 14px;border-radius:999px;border:1px solid rgba(255,184,0,0.22);background:#111111;color:#ffb800;font-size:11px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;">Aimant à prospects</div>
      <h1 style="margin:22px 0 0 0;font-size:58px;line-height:1.02;font-weight:800;color:#ffffff;">${title}</h1>
      <p style="margin:24px 0 0 0;max-width:720px;font-size:22px;line-height:1.7;color:#d4d4d8;">${subtitle}</p>
      <div style="margin-top:30px;">
        <a href="#sio-formulaire" style="display:inline-block;padding:18px 24px;border-radius:18px;background:#ffb800;color:#111111;font-size:18px;font-weight:800;text-decoration:none;">${cta}</a>
      </div>
    </div>
    <div style="padding:28px;border-left:1px solid rgba(255,184,0,0.14);">
      <div style="min-height:420px;border-radius:26px;overflow:hidden;border:1px solid rgba(255,184,0,0.16);background:#111111;display:flex;align-items:center;justify-content:center;">
        ${
          imageSrc
            ? `<img src="${imageSrc}" alt="Visuel du lead" style="width:100%;height:100%;object-fit:cover;" />`
            : `<div style="padding:24px;color:#d4d4d8;">Ajoute un visuel hero depuis l’éditeur</div>`
        }
      </div>
    </div>
  </section>

  <section style="padding:44px;">
    <div style="font-size:28px;font-weight:800;color:#ffb800;">Bénéfices</div>
    <div style="margin-top:20px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;">${benefitsHtml}</div>
  </section>

  <section style="padding:0 44px 44px 44px;">
    <div style="padding:28px;border:1px solid rgba(255,184,0,0.16);border-radius:28px;background:#0d0d0d;">
      <div style="font-size:28px;font-weight:800;color:#ffb800;">${proofTitle}</div>
      <div style="margin-top:16px;font-size:20px;line-height:1.8;color:#d4d4d8;">${proofBody}</div>
    </div>
  </section>

  <section style="padding:0 44px 44px 44px;">
    <div style="padding:28px;border:1px solid rgba(255,184,0,0.16);border-radius:28px;background:#0d0d0d;">
      <div style="font-size:28px;font-weight:800;color:#ffb800;">${faqTitle}</div>
      <div style="margin-top:20px;display:grid;gap:16px;">${faqHtml}</div>
    </div>
  </section>

  <section id="sio-formulaire" style="padding:0 44px 44px 44px;">
    <div style="padding:28px;border:1px dashed rgba(255,184,0,0.30);border-radius:28px;background:#111111;color:#ffb800;text-align:center;font-size:16px;line-height:1.8;">
      👉 Ajoute ici ton formulaire natif Systeme.io juste après avoir collé ce HTML.
    </div>
  </section>
</div>
`.trim();
}

export default function LeadEnginePage() {
  const [editorKey, setEditorKey] = useState(0);
  const [layers, setLayers] = useState<LayerData[]>(() => buildLeadPreset());
  const [copied, setCopied] = useState(false);

  const htmlExport = useMemo(() => buildHtmlExport(layers), [layers]);

  async function copyHtml() {
    try {
      await navigator.clipboard.writeText(htmlExport);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // noop
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-[1800px] px-6 pt-[110px] pb-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-yellow-600/25 bg-[#0b0b0b] px-4 py-2 text-sm font-semibold text-yellow-200"
            >
              <FaArrowLeft />
              Retour Dashboard
            </Link>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-yellow-600/25 bg-[#0b0b0b] px-4 py-1 text-[12px] text-white/75">
              <FaMagic className="text-yellow-300" />
              Lead Builder V4 — Lead Engine
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-[#ffb800]">
              Lead Engine branché sur la vraie structure éditeur
            </h1>
            <p className="mt-2 max-w-3xl text-white/65">
              Colonne gauche adaptée au lead, format Landing SIO pleine page, et export HTML SIO prêt à copier.
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
              onClick={() => setEditorKey((v) => v + 1)}
              className="inline-flex items-center gap-2 rounded-2xl border border-yellow-600/25 bg-[#0b0b0b] px-5 py-3 font-semibold text-white/85"
            >
              <FaRedo className="text-yellow-300" />
              Réinitialiser le preset
            </button>
          </div>
        </div>

        <div className="rounded-[28px] border border-yellow-600/20 bg-[#0b0b0b] p-4 sm:p-5">
          <LeadEditorLayout
            key={editorKey}
            initialLayers={buildLeadPreset()}
            onChange={(nextLayers) => setLayers(nextLayers)}
          />
        </div>

        <div className="mt-6 rounded-[28px] border border-yellow-600/20 bg-[#0b0b0b] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-yellow-300">
                HTML SIO généré
              </div>
              <div className="mt-1 text-sm text-white/55">
                Ce HTML suit la structure actuelle du lead et est prêt à être collé
                dans un bloc Code HTML Systeme.io.
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
            className="mt-4 min-h-[260px] w-full rounded-2xl border border-yellow-600/20 bg-[#111] px-4 py-4 text-sm text-white/80 outline-none"
          />
        </div>
      </div>
    </div>
  );
}