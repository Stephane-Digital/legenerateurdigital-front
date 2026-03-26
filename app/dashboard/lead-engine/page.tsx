// UPDATED VERSION WITH EXPORT MODAL PRO (PHASE 3)
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

const LS_SIO_READY_EXPORT = "lgd_sio_ready_export";

export default function LeadEnginePage() {
  const [showExportModal, setShowExportModal] = useState(false);

  const payload = {
    funnel_name: "Lead Funnel LGD",
    page_name: "Capture Page",
    tag_name: "Lead Magnet LGD",
    campaign_name: "Campaign LGD",
  };

  function handleExport() {
    const json = JSON.stringify(payload, null, 2);
    navigator.clipboard.writeText(json);
    localStorage.setItem(LS_SIO_READY_EXPORT, json);
    window.open("https://app.systeme.io/dashboard", "_blank");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto px-6 pt-[120px]">

        <button
          onClick={() => setShowExportModal(true)}
          className="w-full rounded-2xl px-5 py-4 bg-gradient-to-r from-[#ffb800] to-[#ffcc4d] text-black font-bold"
        >
          Export Système.io PRO
        </button>

        {showExportModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
            <div className="bg-[#111] border border-yellow-500/20 rounded-2xl p-6 w-full max-w-xl">

              <h2 className="text-xl font-bold text-yellow-400">
                Export Système.io
              </h2>

              <div className="mt-4 text-sm text-white/70 space-y-2">
                <p>1. Clique sur exporter</p>
                <p>2. Colle dans Systeme.io</p>
                <p>3. Crée ton funnel</p>
              </div>

              <button
                onClick={handleExport}
                className="mt-6 w-full rounded-xl px-4 py-3 bg-yellow-500 text-black font-semibold"
              >
                Copier + Ouvrir Systeme.io
              </button>

              <button
                onClick={() => setShowExportModal(false)}
                className="mt-3 w-full text-white/60"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
