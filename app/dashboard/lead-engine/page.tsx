"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FaArrowLeft, FaMagic, FaRedo } from "react-icons/fa";

import type { LayerData } from "@/dashboard/automatisations/reseaux_sociaux/carrousel/editor/v5/types/layers";
import EditorLayout from "@/dashboard/automatisations/reseaux_sociaux/carrousel/editor/v5/ui/EditorLayout";

function buildLeadPreset(): LayerData[] {
  return [
    {
      id: "lead-title",
      type: "text",
      x: 74,
      y: 92,
      width: 852,
      text: "Comment générer tes premiers leads qualifiés en 7 jours",
      visible: true,
      selected: false,
      zIndex: 2,
      style: {
        fontSize: 74,
        fontFamily: "Inter",
        color: "#ffffff",
        fontWeight: 800,
      },
    },
    {
      id: "lead-subtitle",
      type: "text",
      x: 78,
      y: 350,
      width: 744,
      text: "Une landing premium pensée pour transformer ton audience en vrais prospects sans dépendre uniquement des algorithmes.",
      visible: true,
      selected: false,
      zIndex: 3,
      style: {
        fontSize: 30,
        fontFamily: "Inter",
        color: "#d4d4d8",
        fontWeight: 500,
      },
    },
    {
      id: "lead-cta",
      type: "text",
      x: 82,
      y: 540,
      width: 520,
      text: "Recevoir la méthode maintenant",
      visible: true,
      selected: false,
      zIndex: 4,
      style: {
        fontSize: 28,
        fontFamily: "Inter",
        color: "#111111",
        fontWeight: 800,
      },
    },
    {
      id: "lead-benefits-title",
      type: "text",
      x: 78,
      y: 820,
      width: 420,
      text: "Bénéfices",
      visible: true,
      selected: false,
      zIndex: 5,
      style: {
        fontSize: 42,
        fontFamily: "Inter",
        color: "#ffb800",
        fontWeight: 800,
      },
    },
    {
      id: "lead-benefit-1",
      type: "text",
      x: 82,
      y: 900,
      width: 840,
      text: "• Attire des prospects plus qualifiés sans complexifier ton marketing.",
      visible: true,
      selected: false,
      zIndex: 6,
      style: {
        fontSize: 28,
        fontFamily: "Inter",
        color: "#ffffff",
        fontWeight: 600,
      },
    },
    {
      id: "lead-benefit-2",
      type: "text",
      x: 82,
      y: 980,
      width: 840,
      text: "• Transforme tes contenus en machine à leads plus cohérente.",
      visible: true,
      selected: false,
      zIndex: 7,
      style: {
        fontSize: 28,
        fontFamily: "Inter",
        color: "#ffffff",
        fontWeight: 600,
      },
    },
    {
      id: "lead-benefit-3",
      type: "text",
      x: 82,
      y: 1060,
      width: 840,
      text: "• Crée une structure premium qui donne envie de s’inscrire.",
      visible: true,
      selected: false,
      zIndex: 8,
      style: {
        fontSize: 28,
        fontFamily: "Inter",
        color: "#ffffff",
        fontWeight: 600,
      },
    },
    {
      id: "lead-proof-title",
      type: "text",
      x: 78,
      y: 1230,
      width: 420,
      text: "Preuve sociale",
      visible: true,
      selected: false,
      zIndex: 9,
      style: {
        fontSize: 42,
        fontFamily: "Inter",
        color: "#ffb800",
        fontWeight: 800,
      },
    },
    {
      id: "lead-proof-body",
      type: "text",
      x: 82,
      y: 1310,
      width: 840,
      text: "Cette structure aide à capter plus facilement des leads réellement intéressés par ton offre.",
      visible: true,
      selected: false,
      zIndex: 10,
      style: {
        fontSize: 28,
        fontFamily: "Inter",
        color: "#d4d4d8",
        fontWeight: 500,
      },
    },
    {
      id: "lead-faq-title",
      type: "text",
      x: 78,
      y: 1500,
      width: 420,
      text: "FAQ",
      visible: true,
      selected: false,
      zIndex: 11,
      style: {
        fontSize: 42,
        fontFamily: "Inter",
        color: "#ffb800",
        fontWeight: 800,
      },
    },
    {
      id: "lead-faq-q1",
      type: "text",
      x: 82,
      y: 1580,
      width: 840,
      text: "Est-ce adapté aux débutants ?",
      visible: true,
      selected: false,
      zIndex: 12,
      style: {
        fontSize: 30,
        fontFamily: "Inter",
        color: "#ffffff",
        fontWeight: 800,
      },
    },
    {
      id: "lead-faq-a1",
      type: "text",
      x: 82,
      y: 1640,
      width: 840,
      text: "Oui, la structure a été pensée pour rester simple à mettre en œuvre.",
      visible: true,
      selected: false,
      zIndex: 13,
      style: {
        fontSize: 26,
        fontFamily: "Inter",
        color: "#d4d4d8",
        fontWeight: 500,
      },
    },
    {
      id: "lead-faq-q2",
      type: "text",
      x: 82,
      y: 1760,
      width: 840,
      text: "Combien de temps faut-il pour l’utiliser ?",
      visible: true,
      selected: false,
      zIndex: 14,
      style: {
        fontSize: 30,
        fontFamily: "Inter",
        color: "#ffffff",
        fontWeight: 800,
      },
    },
    {
      id: "lead-faq-a2",
      type: "text",
      x: 82,
      y: 1820,
      width: 840,
      text: "Le format est conçu pour être actionnable rapidement, sans lecture interminable.",
      visible: true,
      selected: false,
      zIndex: 15,
      style: {
        fontSize: 26,
        fontFamily: "Inter",
        color: "#d4d4d8",
        fontWeight: 500,
      },
    },
  ];
}

export default function LeadEnginePage() {
  const [editorKey, setEditorKey] = useState(0);

  const initialLayers = useMemo(() => buildLeadPreset(), []);
  const initialUI = useMemo(
    () => ({
      formatKey: "pinterest",
      bgMode: "gradient",
      bgColor: "#0b0b0b",
      bgColor1: "#120d02",
      bgColor2: "#050505",
      bgAngle: 180,
      bgImage: null,
      overlayEnabled: false,
      overlayType: "color",
      overlayColor1: "#000000",
      overlayColor2: "#000000",
      overlayOpacity: 0.25,
    }),
    []
  );

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
              Lead Builder V3 — éditeur réel
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-[#ffb800]">
              Lead Engine branché sur la vraie structure éditeur
            </h1>
            <p className="mt-2 max-w-3xl text-white/65">
              Cette version réutilise directement l’éditeur V5 existant avec un preset de landing verticale pour Lead Engine.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setEditorKey((v) => v + 1)}
            className="inline-flex items-center gap-2 rounded-2xl border border-yellow-600/25 bg-[#0b0b0b] px-5 py-3 font-semibold text-white/85"
          >
            <FaRedo className="text-yellow-300" />
            Réinitialiser le preset
          </button>
        </div>

        <div className="rounded-[28px] border border-yellow-600/20 bg-[#0b0b0b] p-4 sm:p-5">
          <EditorLayout
            key={editorKey}
            initialLayers={initialLayers}
            initialUI={initialUI as any}
          />
        </div>
      </div>
    </div>
  );
}
