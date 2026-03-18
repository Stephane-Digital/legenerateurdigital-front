"use client";

import { ArrowLeft, MailCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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

export default function EmailCampaignsPage() {
  const [values, setValues] = useState<EmailCampaignFormValues>(defaultEmailCampaignValues);
  const [sequence, setSequence] = useState<EmailSequenceResponse | null>(null);
  const [savedCampaignId, setSavedCampaignId] = useState<number | null>(null);
  const [resetVersion, setResetVersion] = useState(0);

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
