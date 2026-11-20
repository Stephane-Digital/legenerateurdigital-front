/**
 * LGD S2.B — Préparation d'un brouillon Emailing IA depuis le projet d'Alex.
 * Zéro appel réseau et aucune mutation : fonction déterministe et testable.
 * Les propriétés sont strictement les 18 champs EmailCampaignFormValues.
 */
import type { EmailCampaignFormValues } from "../../../email-campaigns/components/types";

export type AlexEmailDraftContext = {
  offerDescription?: string;
  targetAudienceDescription?: string;
  customObjective?: string;
  businessGoal?: string;
};

export type AlexEmailDraftProject = {
  offerDescription?: string;
  offer_name?: string;
  targetAudienceDescription?: string;
  audience?: string;
  transformationPromise?: string;
  promise?: string;
  customObjective?: string;
  firstRevenueGoal?: string;
  contentAngle?: string;
  salesAngle?: string;
  problemSolved?: string;
  project_name?: string;
};

export type AlexEmailDraft = EmailCampaignFormValues;

const EMPTY_OR_UNDEFINED = /^(?:je ne sais pas|pas encore|à définir|a definir|aucun(?:e)?|non d[eé]fini|n\/?a|inconnu(?:e)?|sans offre|sans cible|automatique|undefined|null)\s*[.!?]*$/i;

function clean(value: unknown, max = 1800): string {
  if (typeof value !== "string") return "";
  const result = value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, " ").trim().replace(/\s+/g, " ");
  return EMPTY_OR_UNDEFINED.test(result) ? "" : result.slice(0, max);
}

function first(...values: unknown[]): string {
  for (const value of values) {
    const normalized = clean(value);
    if (normalized) return normalized;
  }
  return "";
}

/** Aucun nom d'expéditeur, lien de vente ni preuve commerciale ne sont inventés. */
export function prepareAlexEmailDraft(
  context: AlexEmailDraftContext | null | undefined,
  project: AlexEmailDraftProject | null | undefined,
): AlexEmailDraft {
  const offer = first(project?.offerDescription, project?.offer_name, context?.offerDescription);
  const audience = first(project?.targetAudienceDescription, project?.audience, context?.targetAudienceDescription);
  const promise = first(project?.transformationPromise, project?.promise);
  const objective = first(project?.customObjective, context?.customObjective, project?.firstRevenueGoal) ||
    "Présenter cette offre aux contacts qui ont consenti à recevoir mes emails.";
  const label = first(project?.project_name, offer);
  return {
    name: label ? `Alex IA - ${label}`.slice(0, 255) : "Alex IA - Nouvelle campagne",
    campaign_type: "vente",
    duration_days: 5,
    sender_name: "", // Identité réelle obligatoire, non déductible du persona prospect.
    offer_name: offer,
    target_audience: audience,
    main_promise: promise,
    main_objective: objective,
    primary_cta: "Réponds à cet email pour recevoir plus d'informations.",
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

export function validateAlexEmailDraft(values: AlexEmailDraft): string[] {
  const missing: string[] = [];
  if (clean(values.name).length < 2) missing.push("le nom de la campagne");
  if (clean(values.sender_name).length < 2) missing.push("le nom réel de l'expéditeur");
  if (!clean(values.offer_name)) missing.push("une offre ou un produit précis");
  if (!clean(values.target_audience)) missing.push("une cible identifiée");
  if (!clean(values.main_promise)) missing.push("une promesse réaliste et vérifiée");
  if (!clean(values.main_objective)) missing.push("un objectif de campagne");
  if (!clean(values.primary_cta)) missing.push("un appel à l'action");
  return missing;
}

/** Payload du POST /email-campaigns/ : brouillon seulement, sans génération ni livraison. */
export function toEmailCampaignCreatePayload(values: AlexEmailDraft) {
  return {
    ...values,
    generated_sequence: null,
    delivery_platform: "none",
    delivery_status: "draft",
    status: "draft",
    systeme_tag: null,
    systeme_campaign_name: null,
    delivery_payload: null,
  };
}

export const ALEX_EMAIL_DRAFT_FORM_FIELDS = [
  "name", "campaign_type", "duration_days", "sender_name", "offer_name",
  "target_audience", "main_promise", "main_objective", "primary_cta",
  "tone", "sales_intensity", "include_nurture", "include_sales",
  "include_objection", "include_relaunch", "auto_cta",
  "optimize_subjects", "progressive_pressure",
] as const satisfies readonly (keyof AlexEmailDraft)[];
