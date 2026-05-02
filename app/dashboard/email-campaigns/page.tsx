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
  EmailSequenceItem,
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
    email_sequence_text?: string;
    email_sequence?: EmailSequenceItem[];
    cta?: string;
    lead_magnet_idea?: string;
  };
  content_ready?: {
    email?: {
      campaignName?: string;
      campaignType?: EmailCampaignFormValues["campaign_type"];
      offerName?: string;
      targetAudience?: string;
      mainPromise?: string;
      mainObjective?: string;
      primaryCta?: string;
      suggestedSubject?: string;
      previewText?: string;
      firstEmailBody?: string;
      emailSequenceText?: string;
      emailSequence?: EmailSequenceResponse;
    };
  };
  offer?: string;
  audience?: string;
  objective?: string;
  promise?: string;
  cta?: string;
};

type CmoEmailItem = {
  day: number;
  subject: string;
  preheader: string;
  body: string;
  cta?: string;
};

function asCleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function shortText(value: string, max = 90) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
}

function stripLegacyEmailBlocks(text: string) {
  return text
    .replace(/\*\*/g, "")
    .replace(/VERSION COURTE[\s\S]*?(?=VERSION LONGUE|NOTE LGD|={10,}|$)/gi, "")
    .replace(/VERSION LONGUE[\s\S]*?(?=NOTE LGD|={10,}|$)/gi, "")
    .replace(/- Colle uniquement la version courte OU la version longue dans le corps de l’email\./gi, "- Colle le corps complet de l’email dans Systeme.io.")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const CTA_VARIANTS_BY_DAY = [
  "Télécharge le guide et clarifie ton premier pas.",
  "Récupère le guide pour éviter de repartir dans la théorie.",
  "Télécharge le guide et vérifie si cette méthode te correspond.",
  "Accède au guide pour structurer ton offre plus simplement.",
  "Télécharge le guide et transforme ton idée en action concrète.",
  "Récupère le guide avant de repousser encore.",
  "Télécharge le guide si tu veux vraiment commencer maintenant.",
];

function sanitizeEmailBodyText(value: unknown) {
  return stripLegacyEmailBlocks(asCleanString(value))
    .replace(/^\s*👉\s*.+$/gim, "")
    .replace(/\n*À\s+bientôt(?:\s+peut-être)?[\s\S]*$/gi, "")
    .replace(/\n*À\s+très\s+vite[\s\S]*$/gi, "")
    .replace(/\n*Alex IA\s*🤖?[\s\S]*$/gi, "")
    .replace(/\n*Ton Coach LGD[\s\S]*$/gi, "")
    .replace(/\n*LGD\s*$/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getCtaForDay(value: unknown, day: number) {
  const raw = asCleanString(value);
  const generic =
    !raw ||
    /^(téléchargez votre guide gratuit maintenant|découvrez comment commencer dès aujourd'hui|inscrivez-vous dès maintenant pour découvrir notre méthode|passez à l’action maintenant|commencez maintenant)[.!?]?$/i.test(raw);

  if (generic) {
    return CTA_VARIANTS_BY_DAY[Math.max(0, day - 1) % CTA_VARIANTS_BY_DAY.length];
  }

  return raw;
}

function usefulLinksBlock() {
  return [
    "LIENS UTILES À INSÉRER AVANT ENVOI SIO :",
    "- Page de vente / paiement : https://legenerateurdigital.systeme.io/lgd",
    "- Accès plateforme LGD : https://legenerateurdigital-front.vercel.app",
  ].join("\n");
}

function ensureUsefulLinks(text: string) {
  if (/LIENS UTILES À INSÉRER AVANT ENVOI SIO/i.test(text)) return text;
  return `${text}

--------------------------------------------------
${usefulLinksBlock()}`;
}

function sanitizeEmailSequenceResponse(sequence: EmailSequenceResponse | null): EmailSequenceResponse | null {
  if (!sequence) return sequence;

  const copy: any = { ...(sequence as any) };

  const textKeys = ["plainTextExport", "plain_text_export", "export_text", "sequenceText", "plainText", "content"];
  for (const key of textKeys) {
    if (typeof copy[key] === "string") {
      copy[key] = ensureUsefulLinks(stripLegacyEmailBlocks(copy[key]));
    }
  }

  if (Array.isArray(copy.days)) {
    copy.days = copy.days.map((day: any) => ({
      ...day,
      shortMobile: "",
      short_mobile: "",
      mobile: "",
      systemeIoNote: `${usefulLinksBlock()}

NOTE LGD :
- Copie l’objet A, B ou C dans le champ Objet de Systeme.io.
- Copie le préheader dans le champ prévu si disponible.
- Colle le corps complet de l’email dans Systeme.io.
- Remplace [Prénom] par la variable Systeme.io si tu l’utilises.`,
    }));
  }

  return copy as EmailSequenceResponse;
}

function inferCampaignType(payload: CmoAutoPayload): EmailCampaignFormValues["campaign_type"] {
  const text = [
    payload.priority_action,
    payload.next_best_action,
    payload.generated_content?.email_sequence_text,
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

function getCmoEmailText(payload: CmoAutoPayload) {
  return (
    asCleanString(payload.content_ready?.email?.emailSequenceText) ||
    asCleanString(payload.generated_content?.email_sequence_text) ||
    asCleanString(payload.generated_content?.email) ||
    asCleanString(payload.content_ready?.email?.firstEmailBody)
  );
}

function parseCmoEmailSequence(text: string): CmoEmailItem[] {
  const cleaned = stripLegacyEmailBlocks(text);
  if (!cleaned) return [];

  const parts = cleaned.split(/={10,}\s*\n\s*EMAIL\s+(\d+)/gi).filter((part) => part.trim());

  const emails: CmoEmailItem[] = [];

  if (parts.length > 1) {
    for (let index = 0; index < parts.length; index += 2) {
      const day = Number.parseInt(parts[index], 10);
      const content = parts[index + 1] || "";

      if (!Number.isFinite(day) || !content.trim()) continue;

      const subjectMatch = content.match(/Objet\s*:\s*([^\n]+)/i);
      const preheaderMatch = content.match(/Pr[ée]header\s*:\s*([^\n]+)/i);

      const body = content
        .replace(/Objet\s*:\s*[^\n]+\n?/i, "")
        .replace(/Pr[ée]header\s*:\s*[^\n]+\n?/i, "")
        .trim();

      emails.push({
        day,
        subject: asCleanString(subjectMatch?.[1]) || `Email ${day}`,
        preheader: asCleanString(preheaderMatch?.[1]),
        body: sanitizeEmailBodyText(body),
        cta: getCtaForDay("", day),
      });
    }
  }

  if (emails.length > 0) {
    return emails.sort((a, b) => a.day - b.day);
  }

  const subjectMatch = cleaned.match(/Objet\s*:\s*([^\n]+)/i);
  const preheaderMatch = cleaned.match(/Pr[ée]header\s*:\s*([^\n]+)/i);

  const body = cleaned
    .replace(/Objet\s*:\s*[^\n]+\n?/i, "")
    .replace(/Pr[ée]header\s*:\s*[^\n]+\n?/i, "")
    .trim();

  return [
    {
      day: 1,
      subject: asCleanString(subjectMatch?.[1]) || "Email 1",
      preheader: asCleanString(preheaderMatch?.[1]),
      body: sanitizeEmailBodyText(body),
      cta: getCtaForDay("", 1),
    },
  ];
}

function normalizeCmoEmailItems(payload: CmoAutoPayload): CmoEmailItem[] {
  const readyEmails = payload.content_ready?.email?.emailSequence?.emails;
  const generatedEmails = payload.generated_content?.email_sequence;
  const source = Array.isArray(readyEmails) && readyEmails.length ? readyEmails : generatedEmails;

  if (Array.isArray(source) && source.length) {
    return source
      .map((email, index) => ({
        day: Number(email.day || index + 1),
        subject: asCleanString(email.subject) || `Email ${index + 1}`,
        preheader: asCleanString(email.preheader),
        body: sanitizeEmailBodyText(email.body),
        cta: getCtaForDay((email as any).cta, Number(email.day || index + 1)),
      }))
      .filter((email) => email.body)
      .slice(0, 7);
  }

  return parseCmoEmailSequence(getCmoEmailText(payload)).slice(0, 7);
}

function buildEmailExportBlock(email: CmoEmailItem) {
  return `==================================================

EMAIL ${email.day}

Objet : ${email.subject}

Préheader : ${email.preheader}

${sanitizeEmailBodyText(email.body)}`;
}

function buildCmoSequenceResponse(payload: CmoAutoPayload): EmailSequenceResponse | null {
  const ready = payload.content_ready?.email;
  const emails = normalizeCmoEmailItems(payload);

  if (emails.length < 1) return null;

  const cta = asCleanString(ready?.primaryCta) || asCleanString(payload.cta) || "Passer à l’action maintenant";
  const plainTextExport = ensureUsefulLinks(emails.map(buildEmailExportBlock).join("\n\n"));

  const normalizedEmails: EmailSequenceItem[] = emails.map((email) => ({
    day: email.day,
    email_type:
      email.day <= 2 ? "nurture" : email.day === 3 ? "objection" : email.day >= 6 ? "relance" : "vente",
    subject: email.subject,
    preheader: email.preheader,
    body: sanitizeEmailBodyText(email.body),
    cta: getCtaForDay((email as any).cta || cta, email.day),
  }));

  const days = normalizedEmails.map((email) => ({
    day: email.day,
    dayNumber: email.day,
    title: `Email ${email.day}`,
    subject: email.subject,
    subjectA: email.subject,
    subjectB: email.subject,
    subjectC: email.subject,
    subject_a: email.subject,
    subject_b: email.subject,
    subject_c: email.subject,
    subjects: [email.subject],
    preheader: email.preheader,
    previewText: email.preheader,
    preview_text: email.preheader,
    body: email.body,
    content: email.body,
    plainText: sanitizeEmailBodyText(email.body),
    plain_text: sanitizeEmailBodyText(email.body),
    cta: getCtaForDay((email as any).cta || cta, email.day),
    shortMobile: "",
    short_mobile: "",
    mobile: "",
    systemeIoNote: `${usefulLinksBlock()}

NOTE LGD :
- Copie l’objet A, B ou C dans le champ Objet de Systeme.io.
- Copie le préheader dans le champ prévu si disponible.
- Colle le corps complet de l’email dans Systeme.io.
- Remplace [Prénom] par la variable Systeme.io si tu l’utilises.`,
  }));

  return {
    campaignName: asCleanString(ready?.campaignName) || "CMO IA - Séquence humaine V7",
    campaign_name: asCleanString(ready?.campaignName) || "CMO IA - Séquence humaine V7",
    campaign_type: ready?.campaignType || inferCampaignType(payload),
    duration_days: 7,
    sender_name: "Alex IA",
    emails: normalizedEmails,
    plainTextExport,
    plain_text_export: plainTextExport,
    export_text: plainTextExport,
    sequenceText: plainTextExport,
    plainText: plainTextExport,
    content: plainTextExport,
    days,
  } as any as EmailSequenceResponse;
}

function buildCmoEmailValues(
  payload: CmoAutoPayload,
  previous: EmailCampaignFormValues
): EmailCampaignFormValues {
  const ready = payload.content_ready?.email;
  const priorityAction = asCleanString(payload.priority_action);
  const diagnostic = asCleanString(payload.diagnostic);
  const whyThisAction = asCleanString(payload.why_this_action);
  const nextBestAction = asCleanString(payload.next_best_action);
  const emailContent = getCmoEmailText(payload);
  const cta = asCleanString(ready?.primaryCta) || asCleanString(payload.cta) || asCleanString(payload.generated_content?.cta);

  return {
    ...defaultEmailCampaignValues,
    sender_name: previous.sender_name,
    name:
      asCleanString(ready?.campaignName) ||
      (priorityAction ? `CMO IA - ${shortText(priorityAction, 70)}` : "CMO IA - Campagne prioritaire"),
    campaign_type: ready?.campaignType || inferCampaignType(payload),
    duration_days: 7,
    offer_name:
      asCleanString(ready?.offerName) ||
      asCleanString(payload.offer) ||
      cta ||
      shortText(nextBestAction || priorityAction, 90),
    target_audience:
      asCleanString(ready?.targetAudience) ||
      asCleanString(payload.audience) ||
      diagnostic ||
      "Audience prioritaire détectée par le CMO IA.",
    main_promise:
      asCleanString(ready?.mainPromise) ||
      asCleanString(payload.promise) ||
      whyThisAction ||
      emailContent ||
      "Transformer l’attention du prospect en action claire et mesurable.",
    main_objective:
      asCleanString(ready?.mainObjective) ||
      asCleanString(payload.objective) ||
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
        setCmoAutoMessage(
          "Campagne pré-remplie par le CMO IA. Clique sur Générer la séquence pour lancer la vraie génération IA."
        );
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
    setSequence(sanitizeEmailSequenceResponse(nextSequence));
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
            onGenerated={(nextSequence) => setSequence(sanitizeEmailSequenceResponse(nextSequence))}
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
