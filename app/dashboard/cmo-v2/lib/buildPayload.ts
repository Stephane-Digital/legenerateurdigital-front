import type { CMODispatchResult, CMOModule, CMOPayload, CMOTarget } from "../types";
import { buildFallbackDispatch, normalizeDispatchResult } from "./buildStrategy";

function clean(value: unknown, fallback = "") {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text || fallback;
}

function shortText(value: unknown, max = 90) {
  const text = clean(value);
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

function detectCampaignType(text: string): "vente" | "relance" | "lancement" | "nurturing" {
  const lower = text.toLowerCase();
  if (lower.includes("relance")) return "relance";
  if (lower.includes("lancement")) return "lancement";
  if (lower.includes("nurturing") || lower.includes("éduquer") || lower.includes("eduquer")) return "nurturing";
  return "vente";
}

export function moduleToTarget(module: CMOModule): CMOTarget {
  if (module === "email") return "emailing";
  if (module === "lead") return "lead_engine";
  return module;
}

export function targetToModule(target: CMOTarget): CMOModule {
  if (target === "emailing") return "email";
  if (target === "lead_engine") return "lead";
  return target;
}

export function buildPayload(module: CMOModule, objectiveInput: string, blockerInput: string, dispatchInput?: unknown): CMOPayload {
  const target = moduleToTarget(module);
  const dispatch: CMODispatchResult = dispatchInput
    ? normalizeDispatchResult(dispatchInput, objectiveInput, blockerInput, target)
    : buildFallbackDispatch(objectiveInput, blockerInput, target);

  const context = dispatch.context;
  const email = dispatch.module_payloads.emailing;
  const lead = dispatch.module_payloads.lead_engine;
  const editor = dispatch.module_payloads.editor;
  const coach = dispatch.module_payloads.coach;

  const objective = clean(context.objective, objectiveInput);
  const blocker = clean(context.blocker, blockerInput);
  const offer = clean(context.offer, email.offer_name || lead.offer_bridge || "offre à préciser");
  const audience = clean(context.audience, email.target_audience || lead.target_audience || "audience à préciser");
  const promise = clean(context.promise, email.main_promise || lead.lead_magnet_promise || "promesse à préciser");
  const angle = clean(context.angle, email.conversion_angle || lead.lead_magnet_angle || editor.hook_direction);
  const cta = clean(context.cta, email.primary_cta || lead.cta_label || "Passer à l’action");

  return {
    created_at: new Date().toISOString(),
    source: "cmo_dispatch_system",
    target,
    module,
    targetModule: target,
    destination: target,
    cmo_mode: "dispatch_only",
    content_generation: "module_only",

    priority_action: dispatch.decision.priority_action,
    diagnostic: dispatch.diagnostic,
    why_this_action: dispatch.decision.reason,
    next_best_action: dispatch.decision.priority_action,

    objective,
    blocker,
    audience,
    offer,
    promise,
    angle,
    cta,
    tone: clean(context.tone, "premium, humain, direct"),
    dispatch,

    content_ready: {
      email: {
        campaignName: `CMO Dispatch - ${shortText(offer || objective, 70)}`,
        campaignType: detectCampaignType(`${objective} ${blocker} ${angle}`),
        offerName: offer,
        targetAudience: audience,
        mainPromise: promise,
        mainObjective: email.campaign_goal,
        primaryCta: cta,
        suggestedSubject: `${shortText(offer, 48)} : ${shortText(promise, 58)}`,
        previewText: shortText(angle, 120),
        firstEmailBody: [
          `Brief CMO Dispatch pour Emailing IA.`,
          `Objectif : ${email.campaign_goal}`,
          `Offre : ${offer}`,
          `Cible : ${audience}`,
          `Blocage : ${email.main_blocker}`,
          `Angle : ${email.conversion_angle}`,
          `Promesse : ${email.main_promise}`,
          `CTA : ${email.primary_cta}`,
          `Direction de séquence : ${(email.sequence_direction || []).join(" / ")}`,
        ].join("\n"),
        cmoBrief: email,
      },
      lead: {
        magnetName: `Ressource - ${shortText(offer, 45)}`,
        headline: shortText(lead.lead_magnet_angle || angle, 90),
        promise: lead.lead_magnet_promise || promise,
        angle: lead.lead_magnet_angle || angle,
        audience: lead.target_audience || audience,
        offer: lead.offer_bridge || offer,
        cta: lead.cta_label || "Recevoir la ressource",
        cmoBrief: lead,
      },
      editor: {
        format: editor.format_recommendation || "post",
        hook: editor.hook_direction || angle,
        body: editor.body_direction || `${blocker}\n\n${promise}`,
        cta,
        caption: editor.caption_direction || `${angle}\n\n${cta}`,
        cmoBrief: editor,
      },
      coach: {
        missionTitle: coach.mission_title || `Plan CMO — ${shortText(offer, 60)}`,
        brief: coach.brief,
        briefText: `${coach.brief}\n\nSortie attendue : ${coach.expected_output}`,
        kpiLabel: "Plan stratégique validé",
        durationMinutes: coach.duration_minutes || 45,
        cmoBrief: coach,
      },
    },
  };
}
