import { buildEmailSequencePro, type EmailSequencePro } from "./emailEnginePro";

export const CMO_DISPATCH_PAYLOAD_KEY = "lgd_cmo_dispatch_payload";
export const CMO_LEGACY_PAYLOAD_KEY = "lgd_cmo_module_auto_payload";

export type EmailCampaignDraftFromCMO = {
  campaignName: string;
  campaignType: "vente" | "relance" | "lancement" | "nurturing";
  offerName: string;
  targetAudience: string;
  mainPromise: string;
  mainObjective: string;
  primaryCta: string;
  tone: string;
  emailSequence: EmailSequencePro;
};

function readStorage(key: string): unknown | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function text(value: unknown, fallback = ""): string {
  const result = String(value || "").replace(/\s+/g, " ").trim();
  return result || fallback;
}

export function getCMOEmailCampaignDraft(): EmailCampaignDraftFromCMO | null {
  const payload = readStorage(CMO_DISPATCH_PAYLOAD_KEY) || readStorage(CMO_LEGACY_PAYLOAD_KEY);
  if (!payload) return null;

  const root = asRecord(payload);
  const contentReady = asRecord(root.content_ready);
  const emailReady = asRecord(contentReady.email);
  const dispatch = asRecord(root.dispatch);
  const context = asRecord(dispatch.context);

  const offerName = text(emailReady.offerName, text(root.offer, text(context.offer, "offre à préciser")));
  const targetAudience = text(emailReady.targetAudience, text(root.audience, text(context.audience, "audience à préciser")));
  const mainPromise = text(emailReady.mainPromise, text(root.promise, text(context.promise, "promesse à préciser")));
  const mainObjective = text(emailReady.mainObjective, text(root.objective, text(context.objective, "objectif à préciser")));
  const primaryCta = text(emailReady.primaryCta, text(root.cta, text(context.cta, "Passer à l’action maintenant")));
  const pain = text(root.blocker, text(context.pain, text(context.blocker, "blocage à préciser")));
  const angle = text(root.angle, text(context.angle, "angle à préciser"));
  const objection = text(context.objection, pain);
  const tone = text(root.tone, text(context.tone, "premium, humain, direct"));

  const emailSequence = buildEmailSequencePro({
    offer: offerName,
    target: targetAudience,
    pain,
    promise: mainPromise,
    cta: primaryCta,
    angle,
    objection,
    objective: mainObjective,
    tone,
    brand: "LGD",
  });

  return {
    campaignName: text(emailReady.campaignName, emailSequence.campaignName),
    campaignType: emailSequence.campaignType,
    offerName,
    targetAudience,
    mainPromise,
    mainObjective,
    primaryCta,
    tone,
    emailSequence,
  };
}
