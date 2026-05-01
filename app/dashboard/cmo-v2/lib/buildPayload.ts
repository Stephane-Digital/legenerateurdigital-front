import type {
  CMOCoachPayload,
  CMOContext,
  CMODecision,
  CMODispatchResult,
  CMOEditorPayload,
  CMOEmailPayload,
  CMOLeadPayload,
  CMOModule,
  CMOModulePayloads,
  CMOPayload,
  CMOTarget,
} from "../types";
import { buildStrategy } from "./buildStrategy";
import { generateHumanEmail, generateHumanEmailSequence, generateHumanEmailSequenceItems } from "./emailHumanEngine";

function clean(value: string, fallback = "") {
  const text = String(value || "")
    .replace(/\*\*/g, "")
    .replace(/CTA\s*:/gi, "")
    .replace(/Cet email vise[\s\S]*$/gi, "")
    .replace(/Le message est conçu[\s\S]*$/gi, "")
    .replace(/\[Passer à l’action maintenant\]\(#\)/gi, "Passer à l’action maintenant")
    .replace(/\s+/g, " ")
    .trim();

  return text || fallback;
}

function shortText(value: string, max = 90) {
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

function buildHumanSubject(offer: string) {
  const cleanOffer = shortText(offer || "ton projet", 48);
  return `${cleanOffer} : avançons simplement`;
}

function buildHumanPreheader(blocker: string) {
  return `Un message simple pour sortir du blocage : ${shortText(blocker, 90)}`;
}

export function moduleToTarget(module: CMOModule): CMOTarget {
  if (module === "email") return "emailing";
  if (module === "lead") return "lead_engine";
  return module;
}

function normalizeOffer(value: string) {
  const text = clean(value, "votre offre");
  const cleaned = text
    .replace(/\s+à\s+des\s+.+$/i, "")
    .replace(/\s+pour\s+des\s+.+$/i, "")
    .replace(/\s+aux\s+.+$/i, "")
    .replace(/\s+à\s+une\s+.+$/i, "")
    .replace(/\s+qui\s+.+$/i, "")
    .trim();

  return cleaned.length >= 4 ? cleaned : text;
}

function extractOffer(objective: string) {
  const text = clean(objective);
  const lower = text.toLowerCase();

  const patterns = [
    /vendre\s+(?:ma|mon|mes|la|le|les|un|une|des)\s+([^,.!?]+)/i,
    /promouvoir\s+(?:ma|mon|mes|la|le|les|un|une|des)\s+([^,.!?]+)/i,
    /lancer\s+(?:ma|mon|mes|la|le|les|un|une|des)\s+([^,.!?]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return shortText(normalizeOffer(match[1]), 80);
  }

  if (lower.includes("code liberté")) return "formation Code Liberté";
  if (lower.includes("formation")) return "formation";
  if (lower.includes("accompagnement")) return "accompagnement";
  return shortText(text, 80);
}

function buildModulePayloads(params: {
  objective: string;
  blocker: string;
  offer: string;
  audience: string;
  promise: string;
  angle: string;
  cta: string;
  tone: string;
}): CMOModulePayloads {
  const { objective, blocker, offer, audience, promise, angle, cta, tone } = params;

  const emailPayload: CMOEmailPayload = {
    module: "emailing",
    campaign_goal: objective,
    offer_name: offer,
    target_audience: audience,
    main_blocker: blocker,
    conversion_angle: angle,
    main_promise: promise,
    primary_cta: cta,
    tone,
    sequence_direction: [
      "Jour 1 : prise de conscience du blocage",
      "Jour 2 : dispersion et manque de système",
      "Jour 3 : limite des outils isolés",
      "Jour 4 : pont entre idée, contenu, prospect et vente",
      "Jour 5 : désir d’un système simple et humain",
      "Jour 6 : coût réel de la dispersion",
      "Jour 7 : décision claire et passage à l’action",
    ],
  };

  const leadPayload: CMOLeadPayload = {
    module: "lead_engine",
    lead_goal: `Capturer des prospects intéressés par ${offer}`,
    lead_magnet_angle: `Résoudre le blocage : ${blocker}`,
    lead_magnet_promise: promise,
    target_audience: audience,
    problem_to_solve: blocker,
    offer_bridge: `Relier la ressource gratuite à ${offer}`,
    cta_label: "Recevoir la ressource",
    landing_direction: "Landing simple : problème, promesse, bénéfice immédiat, formulaire, CTA.",
  };

  const editorPayload: CMOEditorPayload = {
    module: "editor",
    creative_goal: objective,
    format_recommendation: "post",
    hook_direction: angle,
    body_direction: `Partir du blocage : ${blocker}. Montrer la promesse : ${promise}.`,
    visual_direction: "Design luxe sombre doré, message lisible, contraste fort, CTA visible.",
    caption_direction: `Caption courte : blocage, prise de conscience, solution, CTA ${cta}.`,
  };

  const coachPayload: CMOCoachPayload = {
    module: "coach",
    mission_title: `Clarifier la stratégie — ${shortText(offer, 55)}`,
    brief: `Objectif : ${objective}\nBlocage : ${blocker}\nOffre : ${offer}\nCible : ${audience}\nPromesse : ${promise}\nAngle : ${angle}\nCTA : ${cta}`,
    expected_output: "Plan d’action priorisé, clair et exécutable.",
    duration_minutes: 45,
  };

  return {
    emailing: emailPayload,
    lead_engine: leadPayload,
    editor: editorPayload,
    coach: coachPayload,
  };
}

export function buildPayload(
  module: CMOModule,
  objectiveInput: string,
  blockerInput: string,
  liveDispatch?: CMODispatchResult
): CMOPayload {
  void liveDispatch;

  const objective = clean(objectiveInput, "Créer une action marketing utile aujourd’hui.");
  const blocker = clean(blockerInput, "Le besoin doit être clarifié avant de produire le contenu.");
  const target = moduleToTarget(module);
  const offer = extractOffer(objective);
  const strategy = buildStrategy(objective, blocker);
  const tone = "premium";

  const cta = clean(strategy.cta, offer && offer !== objective ? `Découvrir ${offer}` : "Passer à l’action maintenant");
  const audience = clean(strategy.target, `prospects concernés par l’objectif`);
  const promise = clean(
    strategy.promise,
    `Transformer ce besoin utilisateur en action claire, personnalisée et directement exploitable malgré le blocage : ${blocker}`
  );
  const angle = clean(strategy.angle, `Partir du blocage réel pour rendre ${offer} plus désirable.`);

  const humanEmail =
    module === "email"
      ? generateHumanEmail({
          offer,
          target: audience,
          pain: blocker,
          promise,
          cta,
        })
      : "";

  const humanEmailSequenceItems =
    module === "email"
      ? generateHumanEmailSequenceItems({
          offer,
          target: audience,
          pain: blocker,
          promise,
          cta,
        })
      : [];

  const humanEmailSequence =
    module === "email"
      ? generateHumanEmailSequence({
          offer,
          target: audience,
          pain: blocker,
          promise,
          cta,
        })
      : "";

  const emailOutput = humanEmailSequence;
  const emailSubject = buildHumanSubject(offer);
  const emailPreheader = buildHumanPreheader(blocker);

  const modulePayloads = buildModulePayloads({
    objective,
    blocker,
    offer,
    audience,
    promise,
    angle,
    cta,
    tone,
  });

  const priorityByModule: Record<CMOModule, string> = {
    email: `Envoyer une séquence email humaine complète au module cible.`,
    lead: `Créer une ressource de capture alignée avec ${offer}.`,
    editor: `Créer un contenu social clair pour présenter ${offer}.`,
    coach: `Clarifier la stratégie autour de ${offer}.`,
  };

  const nextByModule: Record<CMOModule, string> = {
    email: `Rédiger une séquence email contextualisée de 7 jours pour vendre ${offer}, avec progression psychologique, objections, désir et CTA.`,
    lead: `Créer un lead magnet ou une landing page qui répond au blocage : ${blocker}`,
    editor: `Créer un post ou carrousel qui part du blocage, présente l’offre et pousse vers le CTA.`,
    coach: `Transformer l’objectif en plan d’action priorisé, étape par étape.`,
  };

  const diagnostic = `Objectif : ${objective}. Blocage : ${blocker}. Le CMO prépare maintenant un brief structuré au lieu de générer un contenu générique.`;
  const whyThisAction = `Cette action est pertinente parce qu’elle part d’une demande réelle de l’utilisateur, de son offre et de son frein actuel, au lieu de générer un contenu générique.`;
  const nextBestAction = nextByModule[module];

  const context: CMOContext = {
    objective,
    blocker,
    offer,
    audience,
    pain: strategy.pain,
    desire: strategy.desire,
    angle,
    promise,
    mechanism: strategy.mechanism,
    objection: blocker,
    cta,
    tone,
  };

  const decision: CMODecision = {
    recommended_module: target,
    priority_action: priorityByModule[module],
    reason: whyThisAction,
  };

  const dispatch: CMODispatchResult = {
    diagnostic,
    decision,
    context,
    module_payloads: modulePayloads,
    assumptions: ["Le CMO agit en dispatch system : il structure le contexte et laisse le module produire le contenu final."],
    warnings: [],
    meta: {
      module: target,
      mode: "safe_dispatch_v7_human_sequence",
      model: "frontend_human_email_engine_v7",
      content_generation: "module_only",
    },
  };

  return {
    created_at: new Date().toISOString(),
    source: "cmo_dispatch_system",
    target,
    module,
    targetModule: target,
    destination: target,
    cmo_mode: "dispatch_only",
    content_generation: "module_only",

    priority_action: priorityByModule[module],
    diagnostic,
    why_this_action: whyThisAction,
    next_best_action: nextBestAction,

    objective,
    blocker,
    audience,
    offer,
    promise,
    angle,
    cta,
    tone,

    dispatch,

    generated_content: {
      post: `${priorityByModule[module]}\n\n${diagnostic}\n\n${cta}`,
      email: emailOutput,
      email_sequence_text: emailOutput,
    },

    content_ready: {
      email: {
        campaignName: `CMO Dispatch - ${shortText(offer, 70)}`,
        campaignType: detectCampaignType(`${objective} ${blocker}`),
        offerName: offer,
        targetAudience: audience,
        mainPromise: promise,
        mainObjective: nextBestAction,
        primaryCta: cta,
        suggestedSubject: emailSubject,
        previewText: emailPreheader,
        firstEmailBody: humanEmail,
        cmoBrief: modulePayloads.emailing,
        emailSequence: {
          campaignName: `CMO Dispatch - ${shortText(offer, 70)}`,
          campaignType: detectCampaignType(`${objective} ${blocker}`),
          offer,
          target: audience,
          promise,
          cta,
          emails: humanEmailSequenceItems.map((item) => ({
            day: item.day,
            email_type:
              item.day <= 2 ? "nurture" : item.day === 3 ? "objection" : item.day >= 6 ? "relance" : "vente",
            subject: item.subject,
            preheader: item.preheader,
            body: item.body,
            cta,
          })),
          days: humanEmailSequenceItems.map((item) => ({
            day: item.day,
            type: item.day <= 2 ? "nurture" : item.day === 3 ? "objection" : item.day >= 6 ? "relance" : "vente",
            label: `Email ${item.day}`,
            subjects: {
              a: item.subject,
              b: item.subject,
              c: item.subject,
            },
            preheader: item.preheader,
            shortMobile: "",
            longStory: item.body,
            ctaVariants: {
              a: cta,
              b: cta,
              c: cta,
            },
            systemeIoNote: "Copie le corps complet de l’email dans Systeme.io.",
          })),
          plainTextExport: emailOutput,
        },
        emailSequenceText: emailOutput,
      },
      lead: {
        magnetName: `Checklist ${shortText(offer, 45)}`,
        headline: `Résous ce blocage : ${shortText(blocker, 80)}`,
        promise,
        angle,
        audience,
        offer,
        cta: "Recevoir la ressource",
        cmoBrief: modulePayloads.lead_engine,
      },
      editor: {
        format: "post",
        hook: angle || `Tu veux ${shortText(objective, 70)} ?`,
        body: `${diagnostic}\n\n${whyThisAction}`,
        cta,
        caption: `${priorityByModule[module]}\n\n${diagnostic}\n\n${cta}`,
        cmoBrief: modulePayloads.editor,
      },
      coach: {
        missionTitle: `Stratégie CMO IA — ${shortText(offer, 60)}`,
        brief: modulePayloads.coach.brief,
        briefText: `${modulePayloads.coach.brief}\n\nDonne-moi un plan d’action clair, priorisé et exécutable.`,
        kpiLabel: "Plan stratégique validé",
        durationMinutes: 45,
        cmoBrief: modulePayloads.coach,
      },
    },
  };
}
