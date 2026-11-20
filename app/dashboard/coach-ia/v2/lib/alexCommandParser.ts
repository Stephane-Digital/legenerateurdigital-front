/** LGD S2.C — reconnaissance locale conservatrice des demandes explicites Emailing IA.
 * Aucun modèle appelé, aucune publication et aucune mutation.
 * Les autres intentions ne déclenchent jamais d'action implicite.
 */
import { prepareAlexEmailDraft, type AlexEmailDraft, type AlexEmailDraftContext, type AlexEmailDraftProject } from "./emailDraftBuilder";

export type AlexCommand =
  | { kind: "email"; text: string; days: 5 | 7 | null; requestedUnsupportedDays: number | null; tone?: AlexEmailDraft["tone"]; campaignType?: AlexEmailDraft["campaign_type"]; offer?: string }
  | { kind: "other"; text: string };

function normalize(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
}

function stripOfferTail(s: string): string {
  return s.replace(/[.!?]+$/, "").replace(/\s+(?:en|avec|pour|pendant)\s+(?:5|7)\s+(?:jours?|emails?|mails?)\b.*$/i, "").trim().slice(0, 170);
}

function readOffer(text: string): string | undefined {
  // Capture uniquement une offre explicitement nommée ; ne fabrique pas une offre.
  const match = text.match(/(?:pour\s+(?:vendre|promouvoir|lancer|presenter|présenter)\s+|(?:pour|sur|concernant)\s+)((?:mon|ma|mes|notre|nos|un|une|le|la|les|l')\s*(?:ebook|e-book|guide|formation|programme|produit|offre|coaching|atelier|service|masterclass)\b[^,;\n]*)/i);
  return match ? stripOfferTail(match[1]) || undefined : undefined;
}

export function parseAlexCommand(message: string): AlexCommand {
  const text = message.trim().slice(0, 1500);
  const s = normalize(text);
  if (!/(?:^|\W)(?:e[ -]?mails?|mailings?|newsletters?|courriels?|sequences? d'?emails?|campagnes? emails?|campagnes? emailing)(?:$|\W)/i.test(s)) {
    return { kind: "other", text };
  }
  // Exemples : « 7 emails », « 5 jours », « en 7 mails », « séquence de 5 emails ».
  const number = s.match(/\b(\d{1,2})\s*(?:e[ -]?mails?|jours?|courriels?)\b/);
  const value = number ? Number(number[1]) : null;
  const days = value === 5 || value === 7 ? value : null;
  const requestedUnsupportedDays = value !== null && days === null ? value : null;
  const tone: AlexEmailDraft["tone"] | undefined = /\bstorytelling\b/.test(s) ? "storytelling" : /\bpedagogiques?\b/.test(s) ? "pedagogique" : /\bdirects?\b/.test(s) ? "direct" : /\bpremiums?\b/.test(s) ? "premium" : undefined;
  const campaignType: AlexEmailDraft["campaign_type"] | undefined = /\brelance(r)?\b/.test(s) ? "relance" : /\blancement\b/.test(s) ? "lancement" : /\bnurtur(?:ing|e)?\b|\bfidelis/.test(s) ? "nurturing" : /\bventes?\b|\bvendre\b|\bpromotion/.test(s) ? "vente" : undefined;
  return { kind: "email", text, days, requestedUnsupportedDays, tone, campaignType, offer: readOffer(text) };
}

export function prepareDraftFromAlexCommand(
  command: Extract<AlexCommand, { kind: "email" }>,
  context: AlexEmailDraftContext | null,
  project: AlexEmailDraftProject | null,
): AlexEmailDraft {
  const base = prepareAlexEmailDraft(context, project);
  const offer_name = command.offer || base.offer_name;
  const requested = command.text.replace(/\s+/g, " ").trim();
  return {
    ...base,
    offer_name,
    name: offer_name ? `Alex IA - ${offer_name}`.slice(0, 255) : base.name,
    ...(command.days ? { duration_days: command.days } : {}),
    ...(command.tone ? { tone: command.tone } : {}),
    ...(command.campaignType ? { campaign_type: command.campaignType } : {}),
    // Conserver l'objectif personnel si existant, sinon reprendre les termes de la demande.
    main_objective: context?.customObjective?.trim() || project?.customObjective?.trim() ||
      (requested ? `Préparer une campagne email selon la demande : ${requested}`.slice(0, 1800) : base.main_objective),
    sender_name: "", // Jamais déduit du persona ou d'un assistant.
  };
}
