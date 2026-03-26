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
  FaTimes,
} from "react-icons/fa";

type LeadMagnetType =
  | "checklist"
  | "mini-guide"
  | "template"
  | "ebook"
  | "challenge";

type DetailLevel = "rapide" | "standard" | "premium";
type ConversionAngle = "leads" | "vente" | "autorite" | "engagement";

type LandingFaqItem = {
  question: string;
  answer: string;
};

type LandingSection = {
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  benefits: string[];
  formIntro: string;
  formButton: string;
  proof: string;
  faq: LandingFaqItem[];
};

type LeadMagnetContent = {
  title: string;
  intro: string;
  items: string[];
};

type SioReadyPayload = {
  source: "lead_engine_v6_phase2";
  funnel_name: string;
  page_name: string;
  form_name: string;
  tag_name: string;
  campaign_name: string;
  landing_page: {
    headline: string;
    subheadline: string;
    cta: string;
    benefits: string[];
    form_intro: string;
    proof: string;
    faq: LandingFaqItem[];
  };
  lead_magnet: {
    title: string;
    type: LeadMagnetType;
    intro: string;
    items: string[];
  };
  emails_sequence: {
    subject: string;
    goal: string;
    body_hint: string;
  }[];
  meta: {
    niche: string;
    target: string;
    promise: string;
    detail_level: DetailLevel;
    conversion_angle: ConversionAngle;
    createdAt: string;
  };
};

type LeadEnginePayload = {
  id: string;
  leadType: LeadMagnetType;
  niche: string;
  target: string;
  promise: string;
  detailLevel: DetailLevel;
  conversionAngle: ConversionAngle;
  magnetName: string;
  hook: string;
  cta: string;
  landingTitle: string;
  createdAt: string;
  landing: LandingSection;
  content: LeadMagnetContent;
  sioReady: SioReadyPayload;
};

type SavedBaseAction =
  | "reuse"
  | "editor"
  | "emailing"
  | "sio"
  | "delete";

const leadMagnetOptions: { value: LeadMagnetType; label: string }[] = [
  { value: "checklist", label: "Checklist" },
  { value: "mini-guide", label: "Mini-guide" },
  { value: "template", label: "Template" },
  { value: "ebook", label: "Ebook" },
  { value: "challenge", label: "Challenge" },
];

const detailLevelOptions: { value: DetailLevel; label: string }[] = [
  { value: "rapide", label: "Rapide" },
  { value: "standard", label: "Standard" },
  { value: "premium", label: "Premium" },
];

const conversionAngleOptions: { value: ConversionAngle; label: string }[] = [
  { value: "leads", label: "Acquisition de leads" },
  { value: "vente", label: "Vente directe" },
  { value: "autorite", label: "Autorité / expertise" },
  { value: "engagement", label: "Engagement / nurturing" },
];

const savedBaseActionOptions: { value: SavedBaseAction; label: string }[] = [
  { value: "reuse", label: "Réutiliser cette base" },
  { value: "editor", label: "Vers l’Éditeur" },
  { value: "emailing", label: "Vers Emailing" },
  { value: "sio", label: "Template SIO" },
  { value: "delete", label: "Supprimer cette base" },
];

const LS_EDITOR_INTELLIGENT_BRIEF = "lgd_editor_intelligent_brief";
const LS_LEAD_ENGINE_V1 = "lgd_lead_engine_v1";
const LS_EMAIL_CAMPAIGN_LEAD_ENGINE = "lgd_email_campaign_lead_engine";
const LS_LIBRARY_LEAD_ENGINE_DRAFT = "lgd_library_lead_engine_draft";
const LS_SIO_LEAD_MAGNET_TEMPLATE = "lgd_sio_lead_magnet_template";
const LS_SIO_READY_EXPORT = "lgd_sio_ready_export_v1";
const LS_LEAD_ENGINE_BASES = "lgd_lead_engine_bases";

function safeSlug(input: string) {
  return (input || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function buildLeadHook(
  niche: string,
  target: string,
  promise: string,
  angle: ConversionAngle
) {
  const n = niche.trim() || "ton marché";
  const t = target.trim() || "ta cible";
  const p = promise.trim() || "un premier résultat rapide";

  if (angle === "vente") {
    return `Le guide express pour aider ${t} à transformer ${n} en ventes plus rapides grâce à ${p}.`;
  }
  if (angle === "autorite") {
    return `Le guide express pour positionner ${t} comme référence dans ${n} tout en obtenant ${p}.`;
  }
  if (angle === "engagement") {
    return `Le guide express pour aider ${t} à créer plus d’engagement et à obtenir ${p} dans ${n}.`;
  }
  return `Le guide express pour aider ${t} à obtenir ${p} dans ${n}.`;
}

function buildLeadMagnetName(type: LeadMagnetType, niche: string, promise: string) {
  const label = leadMagnetOptions.find((item) => item.value === type)?.label || "Lead Magnet";
  const n = niche.trim() || "Business en ligne";
  const p = promise.trim() || "un meilleur résultat";
  return `${label} IA — ${n} pour ${p}`;
}

function buildCTA(promise: string, angle: ConversionAngle) {
  const p = promise.trim() || "ton prochain résultat";
  if (angle === "vente") return `Télécharger maintenant pour vendre plus vite grâce à ${p}`;
  if (angle === "autorite") return `Télécharger maintenant pour renforcer ton expertise et obtenir ${p}`;
  if (angle === "engagement") return `Télécharger maintenant pour créer plus d’engagement et obtenir ${p}`;
  return `Télécharger maintenant pour obtenir ${p}`;
}

function buildLandingTitle(target: string, promise: string) {
  const t = target.trim() || "ta cible";
  const p = promise.trim() || "un résultat concret";
  return `Obtiens ${p} grâce à ce lead magnet pensé pour ${t}`;
}

function detailCount(level: DetailLevel) {
  if (level === "rapide") return 3;
  if (level === "premium") return 5;
  return 4;
}

function buildBenefits(
  niche: string,
  target: string,
  promise: string,
  angle: ConversionAngle,
  level: DetailLevel
) {
  const n = niche.trim() || "ton activité";
  const t = target.trim() || "ta cible";
  const p = promise.trim() || "un résultat concret";
  const base = [
    `Clarifier la méthode la plus simple pour aider ${t} à atteindre ${p}.`,
    `Éviter les erreurs classiques qui bloquent les résultats dans ${n}.`,
    `Passer à l’action rapidement avec une structure claire et réutilisable.`,
  ];

  if (angle === "vente") {
    base.push(`Transformer plus facilement l’intérêt en prise de décision et en ventes.`);
  }
  if (angle === "autorite") {
    base.push(`Renforcer la crédibilité perçue et la confiance autour de ton expertise.`);
  }
  if (angle === "engagement") {
    base.push(`Créer davantage de réponses, clics et interactions qualifiées.`);
  }
  if (level === "premium") {
    base.push(`Donner à ${t} une feuille de route exploitable immédiatement sans surcharge inutile.`);
  }

  return base.slice(0, detailCount(level));
}

function buildFaq(
  target: string,
  promise: string,
  type: LeadMagnetType,
  angle: ConversionAngle
): LandingFaqItem[] {
  const t = target.trim() || "les débutants";
  const p = promise.trim() || "un résultat concret";
  const typeLabel = leadMagnetOptions.find((item) => item.value === type)?.label || "lead magnet";

  return [
    {
      question: `Ce ${typeLabel.toLowerCase()} est-il adapté à ${t} ?`,
      answer: `Oui. Il a été pensé pour rester simple à appliquer et orienté vers ${p}.`,
    },
    {
      question: "Combien de temps faut-il pour l’utiliser ?",
      answer: "Le format est conçu pour être actionnable rapidement, sans lecture interminable.",
    },
    {
      question: "Que vais-je obtenir concrètement ?",
      answer:
        angle === "vente"
          ? "Une structure claire pour passer plus vite de l’attention à la conversion."
          : angle === "autorite"
          ? "Une base claire pour renforcer ta crédibilité tout en guidant ton audience."
          : angle === "engagement"
          ? "Des éléments concrets pour créer plus d’interactions utiles et régulières."
          : "Une base claire pour capter des leads plus qualifiés et mieux préparer la suite.",
    },
  ];
}

function buildLeadContent(
  type: LeadMagnetType,
  niche: string,
  target: string,
  promise: string,
  angle: ConversionAngle,
  level: DetailLevel,
  magnetName: string
): LeadMagnetContent {
  const n = niche.trim() || "ton activité";
  const t = target.trim() || "ta cible";
  const p = promise.trim() || "un résultat concret";
  const count = detailCount(level) + 3;

  if (type === "checklist") {
    return {
      title: magnetName,
      intro: `Checklist pratique pour aider ${t} à obtenir ${p} dans ${n}.`,
      items: Array.from({ length: count }, (_, index) => {
        const number = index + 1;
        if (index === 0) return `${number}. Clarifier l’objectif exact à atteindre avec cette base.`;
        if (index === 1) return `${number}. Définir la promesse principale sans la compliquer inutilement.`;
        if (index === 2) return `${number}. Préparer un CTA unique, simple et orienté action.`;
        if (angle === "vente") return `${number}. Ajouter un élément qui rapproche le prospect de l’achat.`;
        if (angle === "autorite") return `${number}. Ajouter une preuve ou un élément qui renforce l’expertise.`;
        if (angle === "engagement") return `${number}. Ajouter un point qui favorise la réponse ou l’interaction.`;
        return `${number}. Vérifier que chaque point aide vraiment ${t} à avancer vers ${p}.`;
      }),
    };
  }

  if (type === "mini-guide") {
    return {
      title: magnetName,
      intro: `Mini-guide structuré pour aider ${t} à progresser vers ${p}.`,
      items: Array.from({ length: count }, (_, index) => {
        const number = index + 1;
        if (index === 0) return `Introduction — Pourquoi ${p} est stratégique maintenant.`;
        if (index === 1) return `Section ${number} — Les blocages principaux rencontrés par ${t}.`;
        if (index === 2) return `Section ${number} — La méthode simple pour avancer dans ${n}.`;
        if (angle === "vente") return `Section ${number} — Comment transformer l’intérêt en décision.`;
        if (angle === "autorite") return `Section ${number} — Comment augmenter la confiance et la crédibilité.`;
        if (angle === "engagement") return `Section ${number} — Comment obtenir plus de réponses et d’attention.`;
        return `Section ${number} — Action concrète à appliquer pour approcher ${p}.`;
      }),
    };
  }

  if (type === "template") {
    return {
      title: magnetName,
      intro: `Template prêt à compléter pour aider ${t} à obtenir ${p}.`,
      items: Array.from({ length: count }, (_, index) => {
        const number = index + 1;
        if (index === 0) return `[Bloc ${number}] Objectif du template`;
        if (index === 1) return `[Bloc ${number}] Promesse principale`;
        if (index === 2) return `[Bloc ${number}] Étapes d’exécution`;
        if (angle === "vente") return `[Bloc ${number}] Preuve / argument de conversion`;
        if (angle === "autorite") return `[Bloc ${number}] Marqueur d’expertise / crédibilité`;
        if (angle === "engagement") return `[Bloc ${number}] Question / déclencheur d’interaction`;
        return `[Bloc ${number}] Champ à personnaliser pour ${t}`;
      }),
    };
  }

  if (type === "ebook") {
    return {
      title: magnetName,
      intro: `Sommaire d’ebook orienté résultats pour aider ${t} à atteindre ${p}.`,
      items: Array.from({ length: count }, (_, index) => {
        const number = index + 1;
        if (index === 0) return `Chapitre 1 — Le contexte et l’objectif recherché.`;
        if (index === 1) return `Chapitre 2 — Les erreurs à éviter dès le départ.`;
        if (index === 2) return `Chapitre 3 — La méthode principale à appliquer dans ${n}.`;
        if (angle === "vente") return `Chapitre ${number} — Le passage de l’attention à la conversion.`;
        if (angle === "autorite") return `Chapitre ${number} — La crédibilité comme accélérateur de résultats.`;
        if (angle === "engagement") return `Chapitre ${number} — La mécanique d’engagement qui crée de l’élan.`;
        return `Chapitre ${number} — Mise en application concrète vers ${p}.`;
      }),
    };
  }

  return {
    title: magnetName,
    intro: `Challenge simple et actionnable pour aider ${t} à obtenir ${p}.`,
    items: Array.from({ length: count }, (_, index) => {
      const day = index + 1;
      if (day === 1) return `Jour 1 — Clarifier l’objectif final et le point de départ.`;
      if (day === 2) return `Jour 2 — Préparer la structure la plus simple pour avancer.`;
      if (day === 3) return `Jour 3 — Exécuter la première action visible.`;
      if (angle === "vente") return `Jour ${day} — Ajouter un levier orienté décision et conversion.`;
      if (angle === "autorite") return `Jour ${day} — Ajouter un élément qui renforce la confiance.`;
      if (angle === "engagement") return `Jour ${day} — Ajouter un point qui stimule l’interaction.`;
      return `Jour ${day} — Consolider la progression vers ${p}.`;
    }),
  };
}

function buildLandingSection(
  niche: string,
  target: string,
  promise: string,
  angle: ConversionAngle,
  level: DetailLevel,
  cta: string,
  landingTitle: string,
  type: LeadMagnetType
): LandingSection {
  const t = target.trim() || "ta cible";
  const p = promise.trim() || "un résultat concret";
  const n = niche.trim() || "ton marché";

  const subtitle =
    angle === "vente"
      ? `Une page simple pour transformer plus facilement l’intérêt de ${t} en passage à l’action.`
      : angle === "autorite"
      ? `Une page premium pour renforcer ta crédibilité dans ${n} tout en guidant ${t} vers ${p}.`
      : angle === "engagement"
      ? `Une page pensée pour créer plus de réponses, d’attention et d’intérêt qualifié.`
      : `Une page pensée pour transformer ton audience en leads plus qualifiés et exploitables.`;

  return {
    heroTitle: landingTitle,
    heroSubtitle: subtitle,
    heroCta: cta,
    benefits: buildBenefits(niche, target, promise, angle, level),
    formIntro: `Entre ton email pour recevoir immédiatement cette ressource pensée pour ${t}.`,
    formButton: cta,
    proof:
      angle === "vente"
        ? `Cette structure aide à rapprocher plus vite le prospect d’une décision claire.`
        : angle === "autorite"
        ? `Cette structure met en avant la valeur et la crédibilité perçue de ton expertise.`
        : angle === "engagement"
        ? `Cette structure favorise les clics, réponses et interactions utiles.`
        : `Cette structure aide à capter plus facilement des leads réellement intéressés par ${p}.`,
    faq: buildFaq(target, promise, type, angle),
  };
}

function buildEmailsSequence(
  magnetName: string,
  promise: string,
  target: string,
  conversionAngle: ConversionAngle
) {
  const p = promise.trim() || "un résultat concret";
  const t = target.trim() || "ta cible";

  return [
    {
      subject: `Voici ton ressource : ${magnetName}`,
      goal: "Livraison du lead magnet",
      body_hint: `Remettre la ressource, rappeler la promesse ${p} et donner un premier pas simple à ${t}.`,
    },
    {
      subject:
        conversionAngle === "vente"
          ? `Comment passer de l’intérêt à la vente plus vite`
          : conversionAngle === "autorite"
          ? `Le détail qui renforce immédiatement ta crédibilité`
          : conversionAngle === "engagement"
          ? `Le levier simple pour créer plus d’engagement`
          : `Le levier simple pour obtenir des leads plus qualifiés`,
      goal: "Nurturing / valeur",
      body_hint: `Recontextualiser le problème, apporter un conseil clair et préparer la prochaine action.`,
    },
    {
      subject:
        conversionAngle === "vente"
          ? `Prêt à aller plus loin ?`
          : `Quelle est la prochaine étape ?`,
      goal: "CTA vers l’offre ou l’étape suivante",
      body_hint: "Faire le lien entre la ressource gratuite et la prochaine action rentable.",
    },
  ];
}

function buildSioReadyPayload(
  leadType: LeadMagnetType,
  detailLevel: DetailLevel,
  conversionAngle: ConversionAngle,
  niche: string,
  target: string,
  promise: string,
  magnetName: string,
  landing: LandingSection,
  content: LeadMagnetContent
): SioReadyPayload {
  const slug = safeSlug(`${niche}-${promise}`) || "lead-engine";
  return {
    source: "lead_engine_v6_phase2",
    funnel_name: `Funnel LGD - ${magnetName}`,
    page_name: `capture-${slug}`,
    form_name: `form-${slug}`,
    tag_name: `lead-${slug}`,
    campaign_name: `Campaign - ${magnetName}`,
    landing_page: {
      headline: landing.heroTitle,
      subheadline: landing.heroSubtitle,
      cta: landing.heroCta,
      benefits: landing.benefits,
      form_intro: landing.formIntro,
      proof: landing.proof,
      faq: landing.faq,
    },
    lead_magnet: {
      title: content.title,
      type: leadType,
      intro: content.intro,
      items: content.items,
    },
    emails_sequence: buildEmailsSequence(magnetName, promise, target, conversionAngle),
    meta: {
      niche: niche.trim(),
      target: target.trim(),
      promise: promise.trim(),
      detail_level: detailLevel,
      conversion_angle: conversionAngle,
      createdAt: new Date().toISOString(),
    },
  };
}

function buildLeadPayload(
  leadType: LeadMagnetType,
  niche: string,
  target: string,
  promise: string,
  detailLevel: DetailLevel,
  conversionAngle: ConversionAngle
): LeadEnginePayload {
  const magnetName = buildLeadMagnetName(leadType, niche, promise);
  const hook = buildLeadHook(niche, target, promise, conversionAngle);
  const cta = buildCTA(promise, conversionAngle);
  const landingTitle = buildLandingTitle(target, promise);
  const landing = buildLandingSection(
    niche,
    target,
    promise,
    conversionAngle,
    detailLevel,
    cta,
    landingTitle,
    leadType
  );
  const content = buildLeadContent(
    leadType,
    niche,
    target,
    promise,
    conversionAngle,
    detailLevel,
    magnetName
  );
  const sioReady = buildSioReadyPayload(
    leadType,
    detailLevel,
    conversionAngle,
    niche,
    target,
    promise,
    magnetName,
    landing,
    content
  );

  return {
    id: `${Date.now()}`,
    leadType,
    niche: niche.trim(),
    target: target.trim(),
    promise: promise.trim(),
    detailLevel,
    conversionAngle,
    magnetName,
    hook,
    cta,
    landingTitle,
    createdAt: new Date().toISOString(),
    landing,
    content,
    sioReady,
  };
}

export default function LeadEnginePage() {
  const [niche, setNiche] = useState("");
  const [target, setTarget] = useState("");
  const [promise, setPromise] = useState("");
  const [leadType, setLeadType] = useState<LeadMagnetType>("checklist");
  const [detailLevel, setDetailLevel] = useState<DetailLevel>("standard");
  const [conversionAngle, setConversionAngle] = useState<ConversionAngle>("leads");
  const [generated, setGenerated] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [savedBases, setSavedBases] = useState<LeadEnginePayload[]>([]);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [selectedActions, setSelectedActions] = useState<Record<string, SavedBaseAction>>({});

  const preview = useMemo(() => {
    return buildLeadPayload(
      leadType,
      niche,
      target,
      promise,
      detailLevel,
      conversionAngle
    );
  }, [leadType, niche, target, promise, detailLevel, conversionAngle]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(LS_LEAD_ENGINE_BASES);
      if (!raw) return;
      const parsed = JSON.parse(raw) as LeadEnginePayload[];
      setSavedBases(Array.isArray(parsed) ? parsed : []);
    } catch {
      // ignore
    }
  }, []);

  function flash(message: string) {
    setActionMsg(message);
    window.setTimeout(() => setActionMsg(""), 3500);
  }

  function persistBases(next: LeadEnginePayload[]) {
    setSavedBases(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LS_LEAD_ENGINE_BASES, JSON.stringify(next));
    }
  }

  function handleGenerate() {
    setGenerated(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LS_LEAD_ENGINE_V1, JSON.stringify(preview));
    }
    flash("✅ Lead Engine V6 Phase 2 généré.");
  }

  function injectIntoEditor(payload: LeadEnginePayload) {
    if (typeof window === "undefined") return;

    const brief = {
      brief:
        `${payload.hook}\n\n` +
        `Lead magnet : ${payload.magnetName}\n` +
        `Promesse : ${payload.promise || "Résultat rapide"}\n` +
        `CTA : ${payload.cta}\n` +
        `Landing hero : ${payload.landing.heroTitle}`,
      source: "lead_engine_v6_phase2",
      createdAtISO: new Date().toISOString(),
    };

    window.localStorage.setItem(LS_EDITOR_INTELLIGENT_BRIEF, JSON.stringify(brief));
    window.localStorage.setItem(LS_LEAD_ENGINE_V1, JSON.stringify(payload));
    window.location.href = "/dashboard/automatisations/reseaux_sociaux/editor-intelligent";
  }

  function injectIntoEmailing(payload: LeadEnginePayload) {
    if (typeof window === "undefined") return;

    const emailPayload = {
      source: "lead_engine_v6_phase2",
      angle: payload.hook,
      offer_name: payload.magnetName,
      promise: payload.promise,
      cta: payload.cta,
      target: payload.target,
      niche: payload.niche,
      landing_title: payload.landing.heroTitle,
      lead_content_intro: payload.content.intro,
      emails_sequence: payload.sioReady.emails_sequence,
      createdAt: new Date().toISOString(),
    };

    window.localStorage.setItem(LS_EMAIL_CAMPAIGN_LEAD_ENGINE, JSON.stringify(emailPayload));
    window.localStorage.setItem(LS_LEAD_ENGINE_V1, JSON.stringify(payload));
    window.location.href = "/dashboard/email-campaigns";
  }

  function saveToLibrary(payload: LeadEnginePayload) {
    if (typeof window === "undefined") return;

    const libraryPayload = {
      kind: "lgd_lead_engine_v6_phase2",
      title: payload.magnetName,
      data: payload,
      createdAt: new Date().toISOString(),
    };

    window.localStorage.setItem(LS_LIBRARY_LEAD_ENGINE_DRAFT, JSON.stringify(libraryPayload));
    flash("✅ Base Lead Engine sauvegardée pour la Bibliothèque.");
  }

  function prepareSioTemplate(payload: LeadEnginePayload) {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(LS_SIO_LEAD_MAGNET_TEMPLATE, JSON.stringify(payload.sioReady));
    flash("✅ Template Lead Magnet SIO préparé.");
  }

  function exportSioReady(payload: LeadEnginePayload) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LS_SIO_READY_EXPORT, JSON.stringify(payload.sioReady));
    window.localStorage.setItem(LS_SIO_LEAD_MAGNET_TEMPLATE, JSON.stringify(payload.sioReady));
    flash("🚀 Export Système.io Ready généré.");
  }

  function saveCurrentBase() {
    const exists = savedBases.some((item) => item.magnetName === preview.magnetName);
    const next = exists ? savedBases : [preview, ...savedBases];
    persistBases(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LS_LEAD_ENGINE_V1, JSON.stringify(preview));
    }
    flash("✅ Lead Engine Phase 2 sauvegardé.");
  }

  function reuseBase(payload: LeadEnginePayload) {
    setNiche(payload.niche);
    setTarget(payload.target);
    setPromise(payload.promise);
    setLeadType(payload.leadType);
    setDetailLevel(payload.detailLevel || "standard");
    setConversionAngle(payload.conversionAngle || "leads");
    setGenerated(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LS_LEAD_ENGINE_V1, JSON.stringify(payload));
    }
    flash("✅ Lead Engine rechargé.");
  }

  function deleteBase(id: string) {
    const next = savedBases.filter((item) => item.id !== id);
    persistBases(next);
    setSelectedActions((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    flash("🗑️ Base Lead Engine supprimée.");
  }

  function runSavedBaseAction(item: LeadEnginePayload) {
    const action = selectedActions[item.id] || "reuse";

    if (action === "reuse") {
      reuseBase(item);
      return;
    }
    if (action === "editor") {
      injectIntoEditor(item);
      return;
    }
    if (action === "emailing") {
      injectIntoEmailing(item);
      return;
    }
    if (action === "sio") {
      prepareSioTemplate(item);
      return;
    }
    deleteBase(item.id);
  }

  const activePayload = preview;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-7xl px-6 pt-[120px] pb-16">
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
            Lead Engine V6 — Phase 2
          </div>

          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-[#ffb800]">
            Crée ton premier aimant à prospects
          </h1>

          <p className="mt-3 max-w-3xl mx-auto text-white/70">
            LGD génère maintenant la base marketing, la page de capture, le contenu réel
            du lead magnet et un export Système.io prêt à brancher.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 xl:grid-cols-2 gap-8 items-stretch">
          <CardLuxe className="block w-full min-w-0 h-full px-6 py-6">
            <div className="flex h-full flex-col">
              <div className="flex items-center gap-3">
                <FaMagic className="text-[#ffb800] text-2xl" />
                <h2 className="text-2xl font-bold text-[#ffb800]">
                  Configuration V6
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

                <div>
                  <label className="block text-sm font-semibold text-yellow-200 mb-2">
                    Niveau de détail
                  </label>
                  <select
                    value={detailLevel}
                    onChange={(e) => setDetailLevel(e.target.value as DetailLevel)}
                    className="w-full rounded-2xl border border-yellow-600/25 bg-[#0b0b0b] px-4 py-3 text-white outline-none focus:border-yellow-400"
                  >
                    {detailLevelOptions.map((option) => (
                      <option key={option.value} value={option.value} className="bg-[#0b0b0b]">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-yellow-200 mb-2">
                    Angle de conversion
                  </label>
                  <select
                    value={conversionAngle}
                    onChange={(e) => setConversionAngle(e.target.value as ConversionAngle)}
                    className="w-full rounded-2xl border border-yellow-600/25 bg-[#0b0b0b] px-4 py-3 text-white outline-none focus:border-yellow-400"
                  >
                    {conversionAngleOptions.map((option) => (
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
                  Générer la V6 complète
                </button>

                {actionMsg ? (
                  <div className="rounded-2xl border border-yellow-500/25 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">
                    {actionMsg}
                  </div>
                ) : null}
              </div>

              <div className="mt-6 rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 text-sm text-white/65">
                La Phase 2 prépare un payload Système.io standardisé : funnel, page, formulaire,
                tag, campagne et séquence email.
              </div>

              <div className="mt-6 border-t border-yellow-600/15 pt-6">
                <div className="flex items-center gap-3">
                  <FaRocket className="text-[#ffb800] text-2xl" />
                  <h2 className="text-2xl font-bold text-[#ffb800]">
                    Utiliser dans LGD
                  </h2>
                </div>

                <p className="mt-3 text-white/70">
                  À partir de cette Phase 2, tu peux préparer ton contenu, ton emailing,
                  ta bibliothèque et ton export SIO Ready.
                </p>

                <div className="mt-6 flex flex-col gap-4">
                  <button
                    type="button"
                    onClick={() => injectIntoEditor(activePayload)}
                    className="w-full rounded-2xl border border-yellow-600/25 bg-[#0b0b0b] px-5 py-4 text-left hover:bg-yellow-500/10 transition-all"
                  >
                    <div className="flex items-center gap-3 text-yellow-200 font-semibold">
                      <FaEdit />
                      Injecter dans l’Éditeur
                    </div>
                    <p className="mt-2 text-sm text-white/65">
                      Envoie le hook, la promesse, le CTA et l’angle dans l’éditeur intelligent.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => injectIntoEmailing(activePayload)}
                    className="w-full rounded-2xl border border-yellow-600/25 bg-[#0b0b0b] px-5 py-4 text-left hover:bg-yellow-500/10 transition-all"
                  >
                    <div className="flex items-center gap-3 text-yellow-200 font-semibold">
                      <FaMailBulk />
                      Injecter dans Emailing
                    </div>
                    <p className="mt-2 text-sm text-white/65">
                      Prépare la base emailing liée à la landing page et au lead magnet.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => saveToLibrary(activePayload)}
                    className="w-full rounded-2xl border border-yellow-600/25 bg-[#0b0b0b] px-5 py-4 text-left hover:bg-yellow-500/10 transition-all"
                  >
                    <div className="flex items-center gap-3 text-yellow-200 font-semibold">
                      <FaFolderOpen />
                      Sauvegarder en Bibliothèque
                    </div>
                    <p className="mt-2 text-sm text-white/65">
                      Garde cette Phase 2 complète pour la réutiliser plus tard.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => prepareSioTemplate(activePayload)}
                    className="w-full rounded-2xl border border-yellow-600/25 bg-[#0b0b0b] px-5 py-4 text-left hover:bg-yellow-500/10 transition-all"
                  >
                    <div className="flex items-center gap-3 text-yellow-200 font-semibold">
                      <FaRocket />
                      Template Lead Magnet SIO
                    </div>
                    <p className="mt-2 text-sm text-white/65">
                      Prépare la structure standardisée pour Systeme.io.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => exportSioReady(activePayload)}
                    className="w-full rounded-2xl px-5 py-4 text-left font-semibold bg-gradient-to-r from-[#ffb800] to-[#ffcc4d] text-black hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-500/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <FaRocket />
                      Export Système.io Ready
                    </div>
                    <p className="mt-2 text-sm text-black/80">
                      Génère le payload funnel + page + tag + campagne + emails prêt à brancher.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLibraryOpen(true)}
                    className="w-full rounded-2xl border border-yellow-600/25 bg-[#111] px-5 py-4 text-left hover:bg-yellow-500/10 transition-all"
                  >
                    <div className="flex items-center gap-3 text-yellow-200 font-semibold">
                      <FaHistory />
                      Ouvrir la modale Bibliothèque
                    </div>
                    <p className="mt-2 text-sm text-white/65">
                      Consulte toutes tes bases Lead Engine dans une modale dédiée.
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </CardLuxe>

          <CardLuxe className="block w-full min-w-0 h-full px-6 py-6">
            <div className="flex h-full flex-col">
              <div className="flex items-center gap-3">
                <FaBullseye className="text-[#ffb800] text-2xl" />
                <h2 className="text-2xl font-bold text-[#ffb800]">
                  Prévisualisation Phase 2
                </h2>
              </div>

              <div className="mt-6 flex flex-1 flex-col gap-4">
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
                    Landing page preview
                  </div>
                  <div className="mt-3 grid gap-3 text-sm">
                    <div className="rounded-2xl border border-yellow-600/15 bg-[#111] p-3">
                      <div className="text-yellow-200 font-semibold">Hero</div>
                      <p className="mt-2 text-white/80">{preview.landing.heroTitle}</p>
                      <p className="mt-2 text-white/65">{preview.landing.heroSubtitle}</p>
                      <p className="mt-2 text-yellow-100">{preview.landing.heroCta}</p>
                    </div>

                    <div className="rounded-2xl border border-yellow-600/15 bg-[#111] p-3">
                      <div className="text-yellow-200 font-semibold">Bénéfices</div>
                      <ul className="mt-2 grid gap-2 text-white/75">
                        {preview.landing.benefits.map((benefit, index) => (
                          <li key={`benefit-${index}`}>• {benefit}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4">
                  <div className="flex items-center gap-2 text-yellow-200 font-semibold">
                    <FaHistory />
                    Contenu réel du lead magnet
                  </div>
                  <p className="mt-2 text-white/80">{preview.content.title}</p>
                  <p className="mt-2 text-white/65">{preview.content.intro}</p>
                  <ul className="mt-3 grid gap-2 text-sm text-white/75">
                    {preview.content.items.slice(0, 6).map((item, index) => (
                      <li key={`content-${index}`}>• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-yellow-500/25 bg-yellow-500/10 p-4">
                  <div className="flex items-center gap-2 text-yellow-100 font-semibold">
                    <FaRocket />
                    Export SIO Ready
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-white/80">
                    <p><span className="text-yellow-200">Funnel :</span> {preview.sioReady.funnel_name}</p>
                    <p><span className="text-yellow-200">Page :</span> {preview.sioReady.page_name}</p>
                    <p><span className="text-yellow-200">Formulaire :</span> {preview.sioReady.form_name}</p>
                    <p><span className="text-yellow-200">Tag :</span> {preview.sioReady.tag_name}</p>
                    <p><span className="text-yellow-200">Campagne :</span> {preview.sioReady.campaign_name}</p>
                  </div>
                </div>

                {generated ? (
                  <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-center">
                    <div className="text-yellow-200 font-semibold">Phase 2 générée</div>
                    <p className="mt-2 text-sm text-white/75">
                      Le payload Système.io Ready est prêt.
                    </p>
                  </div>
                ) : null}

                <div className="mt-2">
                  <button
                    type="button"
                    onClick={saveCurrentBase}
                    className="w-full rounded-2xl px-5 py-3 font-semibold bg-gradient-to-r from-[#ffb800] to-[#ffcc4d] text-black hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-500/20 transition-all"
                  >
                    Sauvegarder cette base
                  </button>
                </div>
              </div>
            </div>
          </CardLuxe>
        </div>
      </div>

      {libraryOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/75"
            onClick={() => setLibraryOpen(false)}
          />
          <div className="relative z-[101] w-full max-w-5xl">
            <div className="rounded-[28px] border border-yellow-600/20 bg-gradient-to-b from-[#111] to-[#0b0b0b] p-6 shadow-2xl sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-yellow-600/25 bg-[#0b0b0b] px-4 py-1 text-[12px] text-white/75">
                    <FaHistory className="text-yellow-300" />
                    Bibliothèque Lead Engine
                  </div>
                  <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-[#ffb800]">
                    Mes bases Lead Engine
                  </h2>
                  <p className="mt-2 text-white/65">
                    Toutes tes bases Phase 2 sont stockées ici dans une modale dédiée style bibliothèque LGD.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setLibraryOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-yellow-600/25 bg-[#0b0b0b] px-3 py-3 text-yellow-200 hover:bg-yellow-500/10 transition-all"
                  aria-label="Fermer la bibliothèque"
                >
                  <FaTimes />
                </button>
              </div>

              {savedBases.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-6 text-white/65">
                  Aucune base sauvegardée pour le moment.
                </div>
              ) : (
                <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-5 max-h-[65vh] overflow-y-auto pr-1">
                  {savedBases.map((item) => {
                    const currentAction = selectedActions[item.id] || "reuse";

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-5"
                      >
                        <div className="text-yellow-200 font-semibold">{item.magnetName}</div>
                        <p className="mt-2 text-sm text-white/70">{item.hook}</p>
                        <p className="mt-2 text-sm text-white/55">CTA : {item.cta}</p>
                        <p className="mt-2 text-sm text-white/55">
                          Campagne : {item.sioReady?.campaign_name || "Campaign"}
                        </p>

                        <div className="mt-4 grid gap-3">
                          <select
                            value={currentAction}
                            onChange={(e) =>
                              setSelectedActions((prev) => ({
                                ...prev,
                                [item.id]: e.target.value as SavedBaseAction,
                              }))
                            }
                            className="w-full rounded-2xl border border-yellow-600/25 bg-[#111] px-4 py-3 text-sm text-white outline-none focus:border-yellow-400"
                          >
                            {savedBaseActionOptions.map((option) => (
                              <option
                                key={`${item.id}-${option.value}`}
                                value={option.value}
                                className="bg-[#111]"
                              >
                                {option.label}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => runSavedBaseAction(item)}
                            className={[
                              "w-full rounded-2xl px-4 py-3 text-sm font-semibold transition-all",
                              currentAction === "delete"
                                ? "border border-red-500/25 bg-red-500/10 text-red-100 hover:bg-red-500/15"
                                : "bg-gradient-to-r from-[#ffb800] to-[#ffcc4d] text-black hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-500/20",
                            ].join(" ")}
                          >
                            {currentAction === "delete" ? (
                              <span className="inline-flex items-center gap-2">
                                <FaTrash />
                                Exécuter l’action
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-2">
                                <FaRedo />
                                Exécuter l’action
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
