import type { CMOModule, CMOPayload, CMOTarget } from "../types";
import { buildStrategy } from "./buildStrategy";

function clean(value: string, fallback = "") {
  const text = String(value || "").replace(/\s+/g, " ").trim();
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

function moduleToTarget(module: CMOModule): CMOTarget {
  if (module === "email") return "emailing";
  if (module === "lead") return "lead_engine";
  return module;
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
    if (match?.[1]) return shortText(match[1], 80);
  }

  if (lower.includes("formation")) return "formation";
  return shortText(text, 80);
}

export function buildPayload(
  module: CMOModule,
  objectiveInput: string,
  blockerInput: string
): CMOPayload {
  const objective = clean(objectiveInput, "Créer une action marketing utile aujourd’hui.");
  const blocker = clean(blockerInput, "Le besoin doit être clarifié avant de produire le contenu.");
  const target = moduleToTarget(module);
  const offer = extractOffer(objective);
  const strategy = buildStrategy(objective, blocker);

  const cta = strategy.cta || (offer && offer !== objective ? `Découvrir ${offer}` : "Passer à l’action maintenant");
  const audience = strategy.target || `Audience concernée par cet objectif : ${objective}`;
  const promise =
    strategy.promise ||
    `Transformer ce besoin utilisateur en action claire, personnalisée et directement exploitable malgré le blocage : ${blocker}`;

  const priorityByModule: Record<CMOModule, string> = {
    email: `Créer une campagne emailing orientée sur ${offer}.`,
    lead: `Créer une ressource de capture alignée avec ${offer}.`,
    editor: `Créer un contenu social clair pour présenter ${offer}.`,
    coach: `Clarifier la stratégie autour de ${offer}.`,
  };

  const nextByModule: Record<CMOModule, string> = {
    email: `Rédiger une séquence email contextualisée pour vendre ${offer}, avec sujet, promesse, objections et CTA.`,
    lead: `Créer un lead magnet ou une landing page qui répond au blocage : ${blocker}`,
    editor: `Créer un post ou carrousel qui part du blocage, présente l’offre et pousse vers le CTA.`,
    coach: `Transformer l’objectif en plan d’action priorisé, étape par étape.`,
  };

  const diagnostic = `Objectif exprimé par l’utilisateur : ${objective}. Blocage actuel : ${blocker}.`;
  const whyThisAction = `Cette action est pertinente parce qu’elle part d’une demande réelle de l’utilisateur, de son offre et de son frein actuel, au lieu de générer un contenu générique.`;
  const nextBestAction = nextByModule[module];

  return {
    created_at: new Date().toISOString(),
    source: "cmo_v2_assisted",
    target,
    module,
    targetModule: target,
    destination: target,
    priority_action: priorityByModule[module],
    diagnostic,
    why_this_action: whyThisAction,
    next_best_action: nextBestAction,
    objective,
    blocker,
    audience,
    offer,
    promise,
    angle: strategy.angle || priorityByModule[module],
    cta,
    tone: "premium",
    Stepstrategy,
    generated_content: {
      post: `${priorityByModule[module]}\n\n${diagnostic}\n\n${cta}`,
      email: `Bonjour,\n\nTu m’as demandé de travailler sur : ${objective}\n\nLe point à débloquer : ${blocker}\n\nVoici l’angle prioritaire : ${promise}\n\n${cta}`,
      cta,
      lead_magnet_idea: `Checklist rapide pour résoudre : ${blocker}`,
    },
    content_ready: {
      email: {
        campaignName: `CMO IA - ${shortText(objective, 70)}`,
        campaignType: detectCampaignType(`${objective} ${blocker}`),
        offerName: offer,
        targetAudience: audience,
        mainPromise: promise,
        mainObjective: nextBestAction,
        primaryCta: cta,
        suggestedSubject: `${offer} : ton plan d’action est prêt`,
        previewText: `Une séquence orientée sur ton objectif réel : ${shortText(objective, 90)}`,
        firstEmailBody: `Bonjour,\n\nTu m’as demandé de créer une campagne pour : ${objective}\n\nJe pars donc de ton blocage principal : ${blocker}\n\nL’objectif de cette séquence est simple : présenter ${offer}, créer de la confiance, lever les objections et guider vers une action claire.\n\n${cta}`,
      },
      lead: {
        magnetName: `Checklist ${shortText(offer, 45)}`,
        headline: `Résous ce blocage : ${shortText(blocker, 80)}`,
        promise,
        angle: strategy.angle || priorityByModule[module],
        audience,
        offer,
        cta: "Recevoir la ressource",
      },
      editor: {
        format: "post",
        hook: strategy.angle || `Tu veux ${shortText(objective, 70)} ?`,
        body: `${diagnostic}\n\n${whyThisAction}`,
        cta,
        caption: `${priorityByModule[module]}\n\n${diagnostic}\n\n${cta}`,
      },
      coach: {
        missionTitle: `Stratégie CMO IA — ${shortText(offer, 60)}`,
        brief: `Objectif : ${objective}\nBlocage : ${blocker}\nOffre : ${offer}\nCible : ${audience}\nProblème : ${strategy.pain}\nPromesse : ${promise}\nAngle : ${strategy.angle}\nMécanisme : ${strategy.mechanism}\nProchaine action : ${nextBestAction}\nCTA : ${cta}`,
        briefText: `Objectif : ${objective}. Blocage : ${blocker}. Offre : ${offer}. Cible : ${audience}. Problème : ${strategy.pain}. Promesse : ${promise}. Angle : ${strategy.angle}. Mécanisme : ${strategy.mechanism}. CTA : ${cta}. Donne-moi un plan d’action clair, priorisé et exécutable.`,
        kpiLabel: "Plan stratégique validé",
        durationMinutes: 45,
      },
    },
  };
}
