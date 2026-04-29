import type { CMOModule, CMOPayload } from "../types";

export function buildPayload(
  module: CMOModule,
  objective: string,
  blocker: string
): CMOPayload {
  const base = {
    module,
    objective,
    blocker,
    tone: "persuasif",
  } as CMOPayload;

  if (module === "email") {
    base.content_ready = {
      email: {
        subjectHint: "Offre spéciale limitée",
        angle: "résoudre rapidement le blocage principal",
        cta: "Profitez de l’offre maintenant",
      },
    };
  }

  if (module === "lead") {
    base.content_ready = {
      lead: {
        magnetIdea: "Checklist rapide pour débloquer le problème",
        promise: "Résoudre le blocage en 15 minutes",
      },
    };
  }

  if (module === "editor") {
    base.content_ready = {
      editor: {
        postIdea: "Post court orienté problème + solution",
        hook: "Tu fais sûrement cette erreur…",
      },
    };
  }

  if (module === "coach") {
    base.content_ready = {
      coach: {
        briefText: `Objectif: ${objective}. Blocage: ${blocker}. Donne-moi un plan d’action clair et priorisé.`,
      },
    };
  }

  return base;
}
