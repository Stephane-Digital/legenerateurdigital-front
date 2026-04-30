import type { CMOContext, CMODispatchResult, CMOModulePayloads, CMOStrategy, CMOTarget } from "../types";

function clean(value: unknown, fallback = "") {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text || fallback;
}

function normalizeTarget(value: unknown): CMOTarget {
  const text = clean(value).toLowerCase();
  if (["email", "emailing", "email_campaigns"].includes(text)) return "emailing";
  if (["lead", "lead_engine", "lead-engine", "landing"].includes(text)) return "lead_engine";
  if (["editor", "editeur", "éditeur", "post", "carrousel"].includes(text)) return "editor";
  if (["coach", "coach_ia", "coach-ia"].includes(text)) return "coach";
  return "coach";
}

function extractOfferFromObjective(objectiveInput: string) {
  const objective = clean(objectiveInput);
  const lower = objective.toLowerCase();

  const patterns = [
    /vendre\s+(?:ma|mon|mes|la|le|les|un|une|des)\s+([^,.!?]+)/i,
    /promouvoir\s+(?:ma|mon|mes|la|le|les|un|une|des)\s+([^,.!?]+)/i,
    /lancer\s+(?:ma|mon|mes|la|le|les|un|une|des)\s+([^,.!?]+)/i,
  ];

  for (const pattern of patterns) {
    const match = objective.match(pattern);
    if (match?.[1]) {
      return match[1]
        .replace(/\s+à\s+des\s+.+$/i, "")
        .replace(/\s+pour\s+des\s+.+$/i, "")
        .replace(/\s+qui\s+.+$/i, "")
        .trim();
    }
  }

  if (lower.includes("code liberté")) return "formation Code Liberté";
  if (lower.includes("formation")) return "formation";
  if (lower.includes("accompagnement")) return "accompagnement";
  if (lower.includes("lead magnet")) return "lead magnet";
  return "offre à préciser";
}

function detectAudience(objectiveInput: string) {
  const objective = clean(objectiveInput);
  const patterns = [
    /à\s+des\s+([^,.!?]+)/i,
    /pour\s+des\s+([^,.!?]+)/i,
    /aux\s+([^,.!?]+)/i,
    /cible(?:r)?\s+([^,.!?]+)/i,
  ];

  for (const pattern of patterns) {
    const match = objective.match(pattern);
    if (match?.[1]) return clean(match[1], "prospects concernés par l’objectif");
  }

  return "prospects concernés par l’objectif";
}

function buildPromise(params: { offer: string; blocker: string; audience: string }) {
  const { offer, blocker, audience } = params;
  return clean(
    `Aider ${audience} à avancer avec ${offer}, même si le blocage actuel est : ${blocker}`,
    `Aider la cible à avancer malgré : ${blocker}.`
  );
}

export function buildStrategy(objectiveInput: string, blockerInput: string): CMOStrategy {
  const objective = clean(objectiveInput, "Clarifier une action marketing rentable.");
  const blocker = clean(blockerInput, "Le blocage principal doit être clarifié.");
  const offer = extractOfferFromObjective(objective);
  const audience = detectAudience(objective);
  const promise = buildPromise({ offer, blocker, audience });

  return {
    target: audience,
    pain: blocker,
    desire: "obtenir un résultat concret sans perdre de temps",
    promise,
    angle: `Partir du blocage réel pour rendre ${offer} plus désirable et plus rassurant.`,
    mechanism: "brief CMO structuré puis génération par module spécialisé",
    cta: "Passer à l’action maintenant",
  };
}

function fallbackModulePayloads(context: CMOContext): CMOModulePayloads {
  return {
    emailing: {
      module: "emailing",
      campaign_goal: context.objective,
      offer_name: context.offer,
      target_audience: context.audience,
      main_blocker: context.blocker,
      conversion_angle: context.angle,
      main_promise: context.promise,
      primary_cta: context.cta,
      tone: context.tone,
      sequence_direction: [
        "Email 1 : faire résonner le problème et poser le coût de l’inaction.",
        "Email 2 : présenter le mécanisme et la promesse de l’offre.",
        "Email 3 : lever l’objection principale et pousser vers le CTA.",
      ],
    },
    lead_engine: {
      module: "lead_engine",
      lead_goal: `Capturer des prospects intéressés par ${context.offer}`,
      lead_magnet_angle: context.angle,
      lead_magnet_promise: context.promise,
      target_audience: context.audience,
      problem_to_solve: context.blocker,
      offer_bridge: context.offer,
      cta_label: "Recevoir la ressource",
      landing_direction: "Hero clair, bénéfice immédiat, 3 points de valeur, preuve simple, formulaire, CTA.",
    },
    editor: {
      module: "editor",
      creative_goal: context.objective,
      format_recommendation: "post",
      hook_direction: context.angle,
      body_direction: `Montrer le blocage (${context.blocker}), révéler la promesse (${context.promise}), puis guider vers ${context.cta}.`,
      visual_direction: "Visuel premium sombre/doré, message central court, contraste fort, CTA lisible.",
      caption_direction: "Caption courte : problème, prise de conscience, promesse, CTA.",
    },
    coach: {
      module: "coach",
      mission_title: `Plan CMO — ${context.offer}`,
      brief: `Objectif : ${context.objective}\nBlocage : ${context.blocker}\nOffre : ${context.offer}\nCible : ${context.audience}\nAngle : ${context.angle}\nPromesse : ${context.promise}\nCTA : ${context.cta}`,
      expected_output: "Plan d’action priorisé, prochaines étapes, risques à éviter, critères de validation.",
      duration_minutes: 45,
    },
  };
}

export function buildFallbackDispatch(objectiveInput: string, blockerInput: string, targetModule?: CMOTarget): CMODispatchResult {
  const objective = clean(objectiveInput, "Clarifier une action marketing rentable.");
  const blocker = clean(blockerInput, "Le blocage principal doit être clarifié.");
  const offerMatch = objective.match(/vendre\s+(?:ma|mon|mes|la|le|les|un|une|des)\s+([^,.!?]+)/i);
  const offer = offerMatch?.[1]?.trim() || (objective.toLowerCase().includes("formation") ? "la formation Code Liberté" : "offre à préciser");
  const audience = "prospects concernés par l’objectif";

  const context: CMOContext = {
    objective,
    blocker,
    offer,
    audience,
    pain: blocker,
    desire: "obtenir un résultat concret sans perdre de temps",
    angle: `Partir du blocage réel pour rendre ${offer} plus désirable.`,
    promise: `Aider la cible à avancer malgré : ${blocker}.`,
    mechanism: "brief CMO structuré puis génération par module spécialisé",
    objection: "peur de ne pas obtenir de résultat concret",
    cta: "Passer à l’action maintenant",
    tone: "premium, humain, direct",
  };

  return {
    diagnostic: `Objectif : ${objective}. Blocage : ${blocker}. Le CMO prépare maintenant un brief structuré au lieu de générer un contenu générique.`,
    decision: {
      recommended_module: normalizeTarget(targetModule || "coach"),
      priority_action: "Envoyer un contexte marketing propre au module cible.",
      reason: "Le module spécialisé produira un meilleur résultat avec offre, cible, angle, promesse et CTA clairement cadrés.",
    },
    context,
    module_payloads: fallbackModulePayloads(context),
    assumptions: ["Fallback front utilisé si l’API CMO Dispatch n’est pas disponible."],
    warnings: [],
    meta: {
      module: "CMO IA Dispatch",
      mode: "frontend_safe_fallback",
      content_generation: "disabled_at_cmo_level",
    },
  };
}

export function normalizeDispatchResult(raw: unknown, objective: string, blocker: string, targetModule?: CMOTarget): CMODispatchResult {
  const fallback = buildFallbackDispatch(objective, blocker, targetModule);
  const data = raw && typeof raw === "object" ? (raw as Partial<CMODispatchResult>) : {};
  const context = data.context && typeof data.context === "object" ? { ...fallback.context, ...data.context } : fallback.context;
  const basePayloads = fallbackModulePayloads(context as CMOContext);
  const incomingPayloads = data.module_payloads && typeof data.module_payloads === "object" ? data.module_payloads : {};

  return {
    diagnostic: clean(data.diagnostic, fallback.diagnostic),
    decision: {
      recommended_module: normalizeTarget(data.decision?.recommended_module || targetModule || fallback.decision.recommended_module),
      priority_action: clean(data.decision?.priority_action, fallback.decision.priority_action),
      reason: clean(data.decision?.reason, fallback.decision.reason),
    },
    context: context as CMOContext,
    module_payloads: {
      emailing: { ...basePayloads.emailing, ...(incomingPayloads as Partial<CMOModulePayloads>).emailing },
      lead_engine: { ...basePayloads.lead_engine, ...(incomingPayloads as Partial<CMOModulePayloads>).lead_engine },
      editor: { ...basePayloads.editor, ...(incomingPayloads as Partial<CMOModulePayloads>).editor },
      coach: { ...basePayloads.coach, ...(incomingPayloads as Partial<CMOModulePayloads>).coach },
    },
    assumptions: Array.isArray(data.assumptions) && data.assumptions.length ? data.assumptions : fallback.assumptions,
    warnings: Array.isArray(data.warnings) ? data.warnings : fallback.warnings,
    meta: data.meta || fallback.meta,
  };
}
