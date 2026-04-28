"use client";

import { ArrowLeft, MailCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import EmailAnalyticsButton from "./components/EmailAnalyticsButton";
import EmailCampaignDeliveryCard from "./components/EmailCampaignDeliveryCard";
import EmailCampaignGenerator from "./components/EmailCampaignGenerator";
import EmailSequenceViewer from "./components/EmailSequenceViewer";
import SavedEmailCampaignsBlock from "./components/SavedEmailCampaignsBlock";
import {
  defaultEmailCampaignValues,
  EmailCampaignFormValues,
  EmailSequenceResponse,
} from "./components/types";

const CMO_AUTO_PAYLOAD_KEY = "lgd_cmo_module_auto_payload";

type CmoAutoPayload = {
  created_at?: string;
  source?: string;
  target?: string;
  priority_action?: string;
  diagnostic?: string;
  why_this_action?: string;
  next_best_action?: string;
  generated_content?: {
    post?: string;
    email?: string;
    cta?: string;
    lead_magnet_idea?: string;
  };
};

function asCleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function shortText(value: string, max = 90) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
}

function inferCampaignType(payload: CmoAutoPayload): EmailCampaignFormValues["campaign_type"] {
  const text = [
    payload.priority_action,
    payload.next_best_action,
    payload.generated_content?.email,
    payload.generated_content?.cta,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (text.includes("relance")) return "relance";
  if (text.includes("lancement")) return "lancement";
  if (text.includes("nurtur") || text.includes("éduquer") || text.includes("eduquer")) {
    return "nurturing";
  }
  return "vente";
}

function buildCmoEmailValues(
  payload: CmoAutoPayload,
  previous: EmailCampaignFormValues
): EmailCampaignFormValues {
  const priorityAction = asCleanString(payload.priority_action);
  const diagnostic = asCleanString(payload.diagnostic);
  const whyThisAction = asCleanString(payload.why_this_action);
  const nextBestAction = asCleanString(payload.next_best_action);
  const emailContent = asCleanString(payload.generated_content?.email);
  const cta = asCleanString(payload.generated_content?.cta);

  return {
    ...defaultEmailCampaignValues,
    sender_name: previous.sender_name,
    name: priorityAction ? `CMO IA - ${shortText(priorityAction, 70)}` : "CMO IA - Campagne prioritaire",
    campaign_type: inferCampaignType(payload),
    duration_days: 7,
    offer_name: cta || shortText(nextBestAction || priorityAction, 90),
    target_audience: diagnostic || "Audience prioritaire détectée par le CMO IA.",
    main_promise:
      whyThisAction ||
      emailContent ||
      "Transformer l’attention du prospect en action claire et mesurable.",
    main_objective:
      nextBestAction ||
      priorityAction ||
      "Créer une campagne email courte, persuasive et directement exploitable.",
    primary_cta: cta || "Clique ici pour passer à l’action.",
    tone: "premium",
    sales_intensity: "modere",
    include_nurture: true,
    include_sales: true,
    include_objection: true,
    include_relaunch: true,
    auto_cta: true,
    optimize_subjects: true,
    progressive_pressure: true,
  };
}

export default function EmailCampaignsPage() {
  const [values, setValues] = useState<EmailCampaignFormValues>(defaultEmailCampaignValues);
  const [sequence, setSequence] = useState<EmailSequenceResponse | null>(null);
  const [savedCampaignId, setSavedCampaignId] = useState<number | null>(null);
  const [resetVersion, setResetVersion] = useState(0);
  const [cmoAutoLoading, setCmoAutoLoading] = useState(false);
  const [cmoAutoMessage, setCmoAutoMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const key = "lgd_dashboard_daily_progress";
      const raw = window.localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : {};
      const updated = {
        idea: Boolean(parsed?.idea),
        content: Boolean(parsed?.content),
        email: true,
        offer: Boolean(parsed?.offer),
      };
      window.localStorage.setItem(key, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(CMO_AUTO_PAYLOAD_KEY);
      if (!raw) return;

      const payload = JSON.parse(raw) as CmoAutoPayload;
      if (!payload || payload.target !== "emailing") return;

      setCmoAutoLoading(true);
      setCmoAutoMessage("CMO IA analyse la priorité et prépare ta campagne email…");

      window.setTimeout(() => {
        setValues((previous) => buildCmoEmailValues(payload, previous));
        setSequence(null);
        setSavedCampaignId(null);
        setResetVersion((prev) => prev + 1);
        setCmoAutoLoading(false);
        setCmoAutoMessage("Campagne pré-remplie par le CMO IA. Tu peux générer la séquence.");
        window.localStorage.removeItem(CMO_AUTO_PAYLOAD_KEY);

        window.setTimeout(() => {
          setCmoAutoMessage(null);
        }, 4500);
      }, 850);
    } catch (error) {
      console.error("CMO auto payload email error", error);
      setCmoAutoLoading(false);
      setCmoAutoMessage(null);
    }
  }, []);

  const handleResetGenerator = () => {
    setValues(defaultEmailCampaignValues);
    setSequence(null);
    setSavedCampaignId(null);
    setResetVersion((prev) => prev + 1);
  };

  const handleCreateNewCampaign = () => {
    setValues((prev) => ({
      ...defaultEmailCampaignValues,
      sender_name: prev.sender_name,
    }));
    setSequence(null);
    setSavedCampaignId(null);
    setResetVersion((prev) => prev + 1);
  };

  const handleOpenCampaign = (
    nextValues: EmailCampaignFormValues,
    nextSequence: EmailSequenceResponse | null,
    nextSavedCampaignId: number
  ) => {
    setValues(nextValues);
    setSequence(nextSequence);
    setSavedCampaignId(nextSavedCampaignId);
    setResetVersion((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 pb-16 pt-[40px] text-white">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-yellow-400 transition hover:text-yellow-300"
        >
          <ArrowLeft size={16} /> Retour au dashboard
        </Link>

        <div className="mt-5 rounded-[28px] border border-yellow-400/15 bg-gradient-to-br from-[#111111] via-[#0d0d0d] to-[#141414] p-8 shadow-[0_0_50px_rgba(250,204,21,0.05)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-yellow-300">
                <Sparkles size={14} /> Modules IA
              </div>
              <h1 className="mt-4 text-3xl font-bold text-yellow-300 md:text-4xl">
                Campagnes E-mailing IA
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">
                Générez des séquences email 7, 14 ou 30 jours, sauvegardez-les dans LGD puis
                préparez leur diffusion via Systeme.io dans un workflow premium, stable et isolé.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-3xl border border-yellow-400/15 bg-[#171717] px-5 py-4 text-sm text-zinc-300">
              <MailCheck size={18} className="text-yellow-300" />
              Sortie : sujets, préheaders, corps, CTA et payload Systeme.io
            </div>
          </div>

          <div className="mt-6 flex justify-start lg:justify-end">
            <EmailAnalyticsButton />
          </div>
        </div>

        {cmoAutoMessage && (
          <div className="mt-6 rounded-[26px] border border-yellow-400/20 bg-gradient-to-r from-yellow-500/10 via-[#15110a] to-yellow-500/5 p-5 shadow-[0_0_42px_rgba(250,204,21,0.08)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-300">
                  <Sparkles size={18} className={cmoAutoLoading ? "animate-pulse" : ""} />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-yellow-300">
                    Mode CMO IA actif
                  </p>
                  <p className="mt-1 text-sm leading-6 text-zinc-300">{cmoAutoMessage}</p>
                </div>
              </div>
              {cmoAutoLoading && (
                <div className="rounded-full border border-yellow-400/20 bg-black/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-200">
                  Préparation intelligente…
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-6 2xl:grid-cols-[1.05fr_0.95fr]">
          <EmailCampaignGenerator
            values={values}
            setValues={setValues}
            onGenerated={setSequence}
            onResetGenerator={handleResetGenerator}
            onCreateNewCampaign={handleCreateNewCampaign}
          />
          <EmailSequenceViewer
            formValues={values}
            sequence={sequence}
            onSaved={(id) => {
              setSavedCampaignId(id);
              setResetVersion((prev) => prev + 1);
            }}
            onReset={() => {
              setSequence(null);
              setSavedCampaignId(null);
            }}
          />
        </div>

        <div className="mt-6">
          <EmailCampaignDeliveryCard
            key={`${savedCampaignId ?? "none"}-${resetVersion}`}
            savedCampaignId={savedCampaignId}
          />
        </div>

        <div className="mt-6">
          <SavedEmailCampaignsBlock
            resetSignal={resetVersion}
            onOpenCampaign={handleOpenCampaign}
          />
        </div>
      </div>
    </div>
  );
}
