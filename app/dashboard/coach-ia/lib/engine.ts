import type {
  AlexContext,
  AlexBusinessGoal,
  AlexBusinessModel,
  AlexAudienceSize,
  AlexMainBlocker,
  AlexIntent,
  AlexLevel,
  AlexRoadmap,
  AlexToday,
  DayPlan,
  MissionBrief,
  MissionFormat,
  MissionType,
  TimePerDay,
} from "./types";

function nowISO() {
  return new Date().toISOString();
}

function toneFromIntent(intent: AlexIntent): MissionBrief["tone"] {
  switch (intent) {
    case "argent_vite":
      return "direct";
    case "quitter_job":
      return "calme";
    case "complement":
      return "direct";
    case "discipline":
    default:
      return "motivant";
  }
}

function durationFromTimePerDay(t: TimePerDay): number {
  if (t === 30) return 25;
  if (t === 60) return 45;
  return 60;
}

function businessModelForDay(dayIndex: number): MissionBrief["businessModel"] {
  // Pattern simple : alternance CONTENT / MMR / CONTENT / MLR / CONTENT / MMR / BILAN
  if (dayIndex === 2 || dayIndex === 6) return "MMR";
  if (dayIndex === 4) return "MLR";
  if (dayIndex === 7) return "CONTENT";
  return "CONTENT";
}

function formatForDay(dayIndex: number): MissionFormat {
  // Instagram focus : carrousel 2/5, post 1/3/6, story 4, bilan 7
  if (dayIndex === 2 || dayIndex === 5) return "carrousel";
  if (dayIndex === 4) return "story";
  return "post";
}

function typeForDay(dayIndex: number): MissionType {
  // Progression simple : content → content → conversation → content → conversation → vente → content
  if (dayIndex === 3 || dayIndex === 5) return "conversation";
  if (dayIndex === 6) return "vente";
  return "content";
}

/**
 * LGD — règle business :
 * - 1ère vente ASAP (semaines 1–4) ✅ déjà couvert
 * - affiliation LGD en levier parallèle, mais *soft* :
 *   => 1 micro-action / semaine max
 *   => jamais “spam”, toujours via DM mot-clé (“OUTIL”, “SYSTEME”, etc.)
 *
 * On injecte ça uniquement dans la checklist, sans UI ni chat.
 */
function shouldInjectAffiliate(weekIndex: number, dayIndex: number): boolean {
  // 1x/semaine, jour “bilan” (jour 7), dès la semaine 2.
  // Semaine 1 : on évite de distraire (focus profil + 1ère exécution).
  if (dayIndex !== 7) return false;
  if (weekIndex < 2) return false;
  // Semaine 9 est déjà “AMBASSADOR” avec du contenu dédié.
  if (weekIndex === 9) return false;
  return true;
}

function withAffiliateOncePerWeek(weekIndex: number, dayIndex: number, checklist: string[]): string[] {
  if (!shouldInjectAffiliate(weekIndex, dayIndex)) return checklist;

  // Micro-action *soft* : montrer le process, proposer le lien uniquement en DM.
  const affiliateLine =
    "Micro-levier LGD (soft) : fais 1 story 'outil/process' et propose le lien uniquement à ceux qui DM 'OUTIL' (1x/semaine max)";

  // Évite doublons si le user regénère
  if (checklist.some((x) => x.toLowerCase().includes("micro-levier lgd"))) return checklist;

  return [...checklist, affiliateLine];
}

function finalizeDayPlan(weekIndex: number, dayIndex: number, plan: DayPlan): DayPlan {
  return {
    ...plan,
    checklist: withAffiliateOncePerWeek(weekIndex, dayIndex, plan.checklist || []),
  };
}

/**
 * Roadmap progressive:
 * - semaineIndex influence titres/objectifs/checklists/kpi
 * - dayIndex conserve la structure (1..7)
 * - level influence la difficulté (léger, sans changer l'UI)
 */
function dayTemplate(weekIndex: number, dayIndex: number, intent: AlexIntent, level: AlexLevel, timePerDay: TimePerDay): DayPlan {
  const durationMin = durationFromTimePerDay(timePerDay);
  const missionType = typeForDay(dayIndex);
  const format = formatForDay(dayIndex);
  const businessModel = businessModelForDay(dayIndex);

  const isNoResult = level === "sans_resultat";
  const isSomeSales = level === "quelques_ventes";

  const extra = (a: string, b: string, c: string) => {
    if (isSomeSales) return [a, b, c];
    if (isNoResult) return [a, b];
    return [a];
  };

  // =========================
  // SEMAINE 1 — MACHINE
  // =========================
  if (weekIndex === 1) {
    if (dayIndex === 1) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "Mettre ton profil en mode vendeur",
        objective: "Optimiser ton profil Instagram pour attirer des acheteurs",
        checklist: [
          "Bio : 1 promesse + 1 preuve + 1 CTA",
          "3 posts épinglés : preuve, méthode, offre",
          "Lien : une seule action (DM ou page)",
        ],
        kpiLabel: "Profil optimisé (oui/non)",
        durationMin,
        missionType: "content",
        format: "post",
        businessModel: "CONTENT",
      });
    }

    if (dayIndex === 2) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "Carrousel Autorité (attire des prospects)",
        objective: "Publier un carrousel éducatif qui déclenche des réponses",
        checklist: [
          "Choisis 1 problème client brûlant",
          "Donne 3 étapes simples (sans blabla)",
          "Finis par une question + CTA DM",
        ],
        kpiLabel: "Réponses / DMs reçus",
        durationMin,
        missionType: "content",
        format,
        businessModel: "CONTENT",
      });
    }

    if (dayIndex === 3) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "10 prospects + 3 conversations",
        objective: "Démarrer 3 conversations qualifiées",
        checklist: [
          "Trouve 10 profils ciblés",
          "Interagis avec 3 contenus",
          "Envoie 3 DMs (script fourni)",
        ],
        kpiLabel: "Conversations lancées",
        durationMin,
        missionType: "conversation",
        format: "dm_script",
        businessModel,
      });
    }

    if (dayIndex === 4) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "Story Vente douce (MLR/ebook)",
        objective: "Publier une story qui mène à une action",
        checklist: [
          "1 story : problème réel",
          "1 story : solution courte",
          "1 story : CTA (répondre 'GO' / DM)",
        ],
        kpiLabel: "Réponses story",
        durationMin,
        missionType: "content",
        format,
        businessModel: "MLR",
      });
    }

    if (dayIndex === 5) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "Relance simple (DM)",
        objective: "Relancer proprement 5 prospects",
        checklist: [
          "Liste 5 prospects chauds",
          "Relance 1 ligne + question",
          "Propose 1 mini-ressource (ebook/formation)",
        ],
        kpiLabel: "Réponses relance",
        durationMin,
        missionType: "conversation",
        format: "dm_script",
        businessModel: "MMR",
      });
    }

    if (dayIndex === 6) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "Proposition claire (MMR)",
        objective: "Faire 2 propositions simples (sans pression)",
        checklist: [
          "Qualifie : objectif + urgence",
          "Propose : 1 solution + 1 bénéfice",
          "CTA : 'Tu veux que je te montre comment ?'",
        ],
        kpiLabel: "Propositions envoyées",
        durationMin,
        missionType: "vente",
        format: "dm_script",
        businessModel: "MMR",
      });
    }

    return finalizeDayPlan(weekIndex, dayIndex, {
      dayIndex,
      title: "Bilan + optimisation",
      objective: "Consolider ce qui marche et corriger 1 point",
      checklist: [
        "Note ton KPI de la semaine",
        "Choisis 1 blocage majeur",
        "Décide 1 amélioration pour demain",
      ],
      kpiLabel: "KPI semaine (valeur)",
      durationMin: Math.min(durationMin, 35),
      missionType: "content",
      format: "post",
      businessModel: "CONTENT",
    });
  }

  // =========================
  // SEMAINE 2 — ATTRACTION
  // =========================
  if (weekIndex === 2) {
    if (dayIndex === 1) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "Positionnement clair (en 1 phrase)",
        objective: "Clarifier ton message pour attirer les bons prospects",
        checklist: [
          "Décris ta cible en 6 mots",
          "Promesse : résultat + délai + effort",
          "CTA : 'DM MOT-CLE' (1 seul)",
          ...extra("Ajoute 1 preuve (chiffre)", "Ajoute 1 preuve sociale", "Ajoute 1 offre simple"),
        ],
        kpiLabel: "Clarté message (oui/non)",
        durationMin,
        missionType: "content",
        format: "post",
        businessModel: "CONTENT",
      });
    }

    if (dayIndex === 2) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "Carrousel “3 erreurs” (viral simple)",
        objective: "Publier un carrousel qui attire nouveaux abonnés + réponses",
        checklist: [
          "Choisis 1 erreur fréquente",
          "Slide 1 : promesse forte",
          "Slides 2-4 : erreurs + mini fix",
          "Dernière slide : CTA DM",
        ],
        kpiLabel: "Nouveaux abonnés / commentaires",
        durationMin,
        missionType: "content",
        format: "carrousel",
        businessModel: "CONTENT",
      });
    }

    if (dayIndex === 3) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "20 interactions ciblées",
        objective: "Booster ta visibilité sur des prospects chauds",
        checklist: [
          "20 likes ciblés (clients idéaux)",
          "5 commentaires utiles",
          "2 DMs contextuels (sans vendre)",
        ],
        kpiLabel: "Réponses / profils visités",
        durationMin,
        missionType: "conversation",
        format: "dm_script",
        businessModel: "CONTENT",
      });
    }

    if (dayIndex === 4) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "Story “preuve” (avant/après)",
        objective: "Créer une story qui donne confiance",
        checklist: [
          "1 story : preuve (résultat/retour)",
          "1 story : comment tu l’as obtenu",
          "1 story : CTA (répondre 'PREUVE')",
        ],
        kpiLabel: "Réponses story",
        durationMin,
        missionType: "content",
        format: "story",
        businessModel: "MLR",
      });
    }

    if (dayIndex === 5) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "DM d’ouverture (script 2 lignes)",
        objective: "Démarrer 5 conversations sans friction",
        checklist: [
          "Choisis 5 prospects actifs",
          "DM : compliment + question",
          "Relance 24h si pas de réponse",
        ],
        kpiLabel: "Conversations lancées",
        durationMin,
        missionType: "conversation",
        format: "dm_script",
        businessModel: "MMR",
      });
    }

    if (dayIndex === 6) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "Offre “entrée” (ultra simple)",
        objective: "Faire 2 propositions d’étape suivante (sans pression)",
        checklist: [
          "Propose 1 ressource (ebook/mini audit)",
          "Demande : 'Tu veux que je te l’envoie ?'",
          "Si oui : enchaîne avec 1 question de qualif",
        ],
        kpiLabel: "Accords obtenus",
        durationMin,
        missionType: "vente",
        format: "dm_script",
        businessModel: "MMR",
      });
    }

    return finalizeDayPlan(weekIndex, dayIndex, {
      dayIndex,
      title: "Bilan attraction",
      objective: "Analyser ce qui attire + ajuster 1 levier",
      checklist: [
        "Note tes KPI (abonnés/DM/commentaires)",
        "Identifie le contenu #1",
        "Décide 1 amélioration (hook/CTA/angle)",
      ],
      kpiLabel: "KPI semaine (valeur)",
      durationMin: Math.min(durationMin, 35),
      missionType: "content",
      format: "post",
      businessModel: "CONTENT",
    });
  }

  // =========================
  // SEMAINE 3 — CONVERSATIONS
  // =========================
  if (weekIndex === 3) {
    if (dayIndex === 1) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "Script DM (qualif en 3 questions)",
        objective: "Structurer tes conversations pour aller vers une solution",
        checklist: [
          "Q1 : objectif principal ?",
          "Q2 : blocage actuel ?",
          "Q3 : ce qu’il a déjà tenté ?",
          ...extra("Ajoute 1 question budget/délai", "Ajoute 1 question priorité", "Ajoute 1 mini closing"),
        ],
        kpiLabel: "Conversations qualifiées",
        durationMin,
        missionType: "conversation",
        format: "dm_script",
        businessModel: "MMR",
      });
    }

    if (dayIndex === 2) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "Carrousel “FAQ” (DM booster)",
        objective: "Publier un carrousel qui déclenche des questions en DM",
        checklist: [
          "Liste 5 questions fréquentes",
          "Réponse courte + preuve",
          "CTA : 'DM FAQ' pour template",
        ],
        kpiLabel: "DM reçus",
        durationMin,
        missionType: "content",
        format: "carrousel",
        businessModel: "CONTENT",
      });
    }

    if (dayIndex === 3) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "10 relances propres",
        objective: "Relancer sans forcer (et récupérer des réponses)",
        checklist: [
          "10 relances : 1 phrase + 1 question",
          "Pas de pavé",
          "Propose 1 option simple (A/B)",
        ],
        kpiLabel: "Réponses relance",
        durationMin,
        missionType: "conversation",
        format: "dm_script",
        businessModel: "MMR",
      });
    }

    if (dayIndex === 4) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "Story “objection” (réponse courte)",
        objective: "Traiter une objection fréquente en story",
        checklist: [
          "Objection : 'j’ai pas le temps'",
          "Réponse : 1 vérité + 1 solution",
          "CTA : répondre 'OK' si concerné",
        ],
        kpiLabel: "Réponses story",
        durationMin,
        missionType: "content",
        format: "story",
        businessModel: "MLR",
      });
    }

    if (dayIndex === 5) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "Mini-audit DM (5 minutes)",
        objective: "Créer de la valeur en DM pour déclencher une suite",
        checklist: [
          "Choisis 5 prospects",
          "1 observation + 1 amélioration",
          "Question : 'Tu veux que je te donne le plan ?'",
        ],
        kpiLabel: "Demandes de suite",
        durationMin,
        missionType: "conversation",
        format: "dm_script",
        businessModel: "MMR",
      });
    }

    if (dayIndex === 6) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "Proposition d’étape suivante",
        objective: "Convertir 2 conversations en étape suivante",
        checklist: [
          "Résumé en 1 phrase (problème)",
          "Propose 1 solution + 1 bénéfice",
          "CTA : 'Tu préfères A ou B ?'",
        ],
        kpiLabel: "Étapes suivantes acceptées",
        durationMin,
        missionType: "vente",
        format: "dm_script",
        businessModel: "MMR",
      });
    }

    return finalizeDayPlan(weekIndex, dayIndex, {
      dayIndex,
      title: "Bilan conversations",
      objective: "Analyser DM → corriger 1 blocage",
      checklist: [
        "KPI : réponses / qualifs / propositions",
        "Choisis 1 blocage dominant",
        "Décide 1 ajustement (script/hook/CTA)",
      ],
      kpiLabel: "KPI semaine (valeur)",
      durationMin: Math.min(durationMin, 35),
      missionType: "content",
      format: "post",
      businessModel: "CONTENT",
    });
  }

  // =========================
  // SEMAINE 5 — STABILIZE (process répétable)
  // =========================
  if (weekIndex === 5) {
    if (dayIndex === 1) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "Ton pipeline 3 étapes (simple)",
        objective: "Stabiliser un processus répétable : contenu → DM → offre",
        checklist: [
          "1 post / 1 carrousel = 1 CTA DM (mot-clé)",
          "Script DM en 3 messages (question → valeur → proposition)",
          "Créer une note “objections + réponses” (5 items)",
        ],
        kpiLabel: "DM envoyés",
        durationMin,
        missionType: "conversation",
        format: "dm_script",
        businessModel: "MMR",
      });
    }
    if (dayIndex === 2) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "Follow-up intelligent",
        objective: "Relancer sans être lourd (et closer)",
        checklist: [
          "Liste 10 prospects tièdes",
          "Relance 1 : question simple + bénéfice",
          "Relance 2 : preuve + CTA",
        ],
        kpiLabel: "Réponses obtenues",
        durationMin,
        missionType: "vente",
        format: "post",
        businessModel: "MMR",
      });
    }
    if (dayIndex === 3) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "Preuve express",
        objective: "Créer une preuve visible (même petite) pour augmenter la conversion",
        checklist: [
          "Capture / résultat / témoignage",
          "1 story + 1 post preuve",
          "CTA : 'DM PREUVE' ou 'DM OFFRE'",
        ],
        kpiLabel: "DM reçus",
        durationMin,
        missionType: "content",
        format: "post",
        businessModel: "CONTENT",
      });
    }
    if (dayIndex === 4) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "Offre 2.0 (bonus + rareté soft)",
        objective: "Améliorer l’offre sans la compliquer",
        checklist: [
          "Ajouter 1 bonus simple",
          "Ajouter 1 limite (places / période) sans mensonge",
          "Reformuler la promesse en 1 phrase",
        ],
        kpiLabel: "Offre améliorée (oui/non)",
        durationMin,
        missionType: "content",
        format: "post",
        businessModel: "MMR",
      });
    }
    if (dayIndex === 5) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "DM Sprint (20 messages)",
        objective: "Créer du volume de conversations qualifiées",
        checklist: [
          "Identifier 20 personnes (problème correspondant)",
          "Envoyer 1 message court (question + empathie)",
          "Proposer une ressource gratuite + CTA DM",
        ],
        kpiLabel: "Messages envoyés",
        durationMin,
        missionType: "conversation",
        format: "post",
        businessModel: "MMR",
      });
    }
    if (dayIndex === 6) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "Carrousel “3 erreurs”",
        objective: "Attirer des prospects et les pousser en DM",
        checklist: [
          "Titre punchy",
          "3 erreurs + mini solution",
          "CTA : 'DM CHECK' pour la checklist",
        ],
        kpiLabel: "DM reçus",
        durationMin,
        missionType: "content",
        format: "carrousel",
        businessModel: "CONTENT",
      });
    }
    return finalizeDayPlan(weekIndex, dayIndex, {
      dayIndex,
      title: "Bilan semaine + prochaine action",
      objective: "Analyser ce qui a converti et répéter",
      checklist: [
        "Mesurer : posts → DM → appels → ventes",
        "Choisir 1 action à répéter x2 la semaine prochaine",
        "Supprimer 1 friction",
      ],
      kpiLabel: "Ventes semaine",
      durationMin,
      missionType: "content",
      format: "post",
      businessModel: "MMR",
    });
  }

  // =========================
  // SEMAINE 6 — STABILIZE (suivi + preuves)
  // =========================
  if (weekIndex === 6) {
    if (dayIndex === 1) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "Script DM “qualification”",
        objective: "Qualifier vite et éviter les échanges inutiles",
        checklist: [
          "Question 1 : objectif",
          "Question 2 : budget / timing",
          "Question 3 : blocage principal",
          "Si qualifié : proposer l’offre + CTA",
        ],
        kpiLabel: "Prospects qualifiés",
        durationMin,
        missionType: "vente",
        format: "post",
        businessModel: "MMR",
      });
    }
    if (dayIndex === 2) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "Preuve + storytelling",
        objective: "Raconter une mini histoire crédible (avant → après)",
        checklist: [
          "Contexte (2 lignes)",
          "Déclic (1 phrase)",
          "Résultat (preuve)",
          "CTA : DM 'HISTOIRE'",
        ],
        kpiLabel: "Réponses story",
        durationMin,
        missionType: "content",
        format: "post",
        businessModel: "CONTENT",
      });
    }
    if (dayIndex === 3) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "Offre en 3 bullets",
        objective: "Rendre l’offre facile à dire et à comprendre",
        checklist: [
          "Bullet 1 : résultat",
          "Bullet 2 : méthode / livrable",
          "Bullet 3 : délai / accompagnement",
          "CTA : DM 'OFFRE'",
        ],
        kpiLabel: "DM reçus",
        durationMin,
        missionType: "vente",
        format: "post",
        businessModel: "MMR",
      });
    }
    if (dayIndex === 4) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "Mini audit profil (10 min)",
        objective: "Optimiser le profil pour augmenter le taux de DM",
        checklist: [
          "Bio : promesse + preuve + CTA",
          "3 posts épinglés : preuve / méthode / offre",
          "Lien : une seule action",
        ],
        kpiLabel: "Profil optimisé (oui/non)",
        durationMin,
        missionType: "content",
        format: "post",
        businessModel: "CONTENT",
      });
    }
    if (dayIndex === 5) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "DM Follow-up (10 relances)",
        objective: "Récupérer des prospects perdus",
        checklist: [
          "Relance courte + question",
          "Relance valeur + preuve",
          "Relance rareté soft (places / timing)",
        ],
        kpiLabel: "Réponses obtenues",
        durationMin,
        missionType: "vente",
        format: "post",
        businessModel: "MMR",
      });
    }
    if (dayIndex === 6) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "Carrousel “méthode”",
        objective: "Montrer ta méthode et déclencher des DM",
        checklist: [
          "Titre : le résultat",
          "3-5 slides : étapes",
          "CTA : DM 'METHODE'",
        ],
        kpiLabel: "DM reçus",
        durationMin,
        missionType: "content",
        format: "carrousel",
        businessModel: "CONTENT",
      });
    }
    return finalizeDayPlan(weekIndex, dayIndex, {
      dayIndex,
      title: "Bilan + plan semaine suivante",
      objective: "Stabiliser un rythme et préparer l’accélération",
      checklist: [
        "Choisir 1 format gagnant",
        "Bloquer 3 créneaux création contenu",
        "Fixer un objectif DM/jour",
      ],
      kpiLabel: "Ventes semaine",
      durationMin,
      missionType: "content",
      format: "post",
      businessModel: "MMR",
    });
  }

  // =========================
  // SEMAINE 7-8 — SCALE
  // =========================
  if (weekIndex === 7 || weekIndex === 8) {
    if (dayIndex === 1) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "Volume contenu (batch)",
        objective: "Produire plus vite sans perdre en qualité",
        checklist: [
          "Lister 10 idées (douleurs / objections / preuves)",
          "Créer 3 posts + 1 carrousel (brouillons)",
          "CTA DM sur chaque contenu",
        ],
        kpiLabel: "Contenus préparés",
        durationMin,
        missionType: "content",
        format: "post",
        businessModel: "CONTENT",
      });
    }
    if (dayIndex === 2) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "Optimiser le CTA",
        objective: "Augmenter le taux de DM",
        checklist: [
          "Tester 2 mots-clés DM",
          "Raccourcir le message CTA",
          "Ajouter une preuve au CTA",
        ],
        kpiLabel: "DM reçus",
        durationMin,
        missionType: "conversation",
        format: "dm_script",
        businessModel: "MMR",
      });
    }
    if (dayIndex === 3) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "Partenariats (3 prises de contact)",
        objective: "Récupérer du trafic qualifié via collaboration",
        checklist: [
          "Lister 10 comptes complémentaires",
          "Contacter 3 (proposition simple)",
          "Proposer échange de story / live / post",
        ],
        kpiLabel: "Contacts envoyés",
        durationMin,
        missionType: "conversation",
        format: "post",
        businessModel: "CONTENT",
      });
    }
    if (dayIndex === 4) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "Preuve x2 (avant/après)",
        objective: "Renforcer la crédibilité à grande échelle",
        checklist: [
          "1 preuve perso",
          "1 preuve client/élève (même micro)",
          "Transformer en post + story",
        ],
        kpiLabel: "Preuves publiées",
        durationMin,
        missionType: "content",
        format: "post",
        businessModel: "CONTENT",
      });
    }
    if (dayIndex === 5) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "DM Sprint (30 messages)",
        objective: "Créer du volume et closer",
        checklist: [
          "30 messages courts (question)",
          "10 follow-ups intelligents",
          "Proposition claire à ceux qui répondent",
        ],
        kpiLabel: "Messages envoyés",
        durationMin,
        missionType: "conversation",
        format: "post",
        businessModel: "MMR",
      });
    }
    if (dayIndex === 6) {
      return finalizeDayPlan(weekIndex, dayIndex, {
        dayIndex,
        title: "Carrousel “cas pratique”",
        objective: "Apporter de la valeur et déclencher des DM",
        checklist: [
          "Problème → solution",
          "3 étapes",
          "CTA : DM 'CAS' pour détails",
        ],
        kpiLabel: "DM reçus",
        durationMin,
        missionType: "content",
        format: "carrousel",
        businessModel: "CONTENT",
      });
    }
    return finalizeDayPlan(weekIndex, dayIndex, {
      dayIndex,
      title: "Bilan scale",
      objective: "Identifier le levier #1 et doubler dessus",
      checklist: [
        "Quel contenu a le meilleur ratio DM/portée ?",
        "Quel script DM convertit le mieux ?",
        "Décider : doubler le volume sur ce levier",
      ],
      kpiLabel: "Ventes semaine",
      durationMin,
      missionType: "content",
      format: "post",
      businessModel: "MMR",
    });
  }

  // =========================
  // SEMAINE 9 — AMBASSADOR (affiliation LGD 60%, subtil)
  // =========================
  if (weekIndex === 9) {
    if (dayIndex === 1) {
      return {
        dayIndex,
        title: "Story “outil” (LGD) — soft",
        objective: "Partager ton process et introduire LGD sans spam",
        checklist: [
          "Montrer ton workflow (contenu → DM → offre)",
          "Dire : 'je te montre l’outil que j’utilise' (sans forcer)",
          "CTA : DM 'OUTIL' si la personne veut le lien",
        ],
        kpiLabel: "DM OUTIL",
        durationMin,
        missionType: "content",
        format: "story",
        businessModel: "CONTENT",
      };
    }
    if (dayIndex === 2) {
      return {
        dayIndex,
        title: "Post “avant / après” (avec outil)",
        objective: "Prouver l’impact (temps gagné / résultats)",
        checklist: [
          "Avant : galère / perte de temps",
          "Après : structure + exécution",
          "CTA : DM 'PLAN' pour recevoir le lien",
        ],
        kpiLabel: "DM PLAN",
        durationMin,
        missionType: "content",
        format: "post",
        businessModel: "CONTENT",
      };
    }
    if (dayIndex === 3) {
      return {
        dayIndex,
        title: "Mini guide gratuit",
        objective: "Offrir une ressource et qualifier les prospects",
        checklist: [
          "1 page : checklist 1ère vente",
          "Distribuer en DM",
          "CTA : 'si tu veux la version complète, je t’envoie le lien'",
        ],
        kpiLabel: "Guides envoyés",
        durationMin,
        missionType: "conversation",
        format: "dm_script",
        businessModel: "CONTENT",
      };
    }
    if (dayIndex === 4) {
      return {
        dayIndex,
        title: "DM follow-up affiliation (soft)",
        objective: "Relancer proprement les intéressés",
        checklist: [
          "Relance courte",
          "1 bénéfice concret",
          "Proposer le lien si OK",
        ],
        kpiLabel: "Liens envoyés",
        durationMin,
        missionType: "vente",
        format: "post",
        businessModel: "CONTENT",
      };
    }
    if (dayIndex === 5) {
      return {
        dayIndex,
        title: "Post “résultats + invitation”",
        objective: "Convertir sans vendre agressivement",
        checklist: [
          "1 résultat (chiffre/DM/vente)",
          "1 apprentissage",
          "CTA : DM 'LGD' si la personne veut le même système",
        ],
        kpiLabel: "DM LGD",
        durationMin,
        missionType: "content",
        format: "post",
        businessModel: "CONTENT",
      };
    }
    if (dayIndex === 6) {
      return {
        dayIndex,
        title: "Carrousel “système”",
        objective: "Montrer le système complet (et inviter en DM)",
        checklist: [
          "Slide 1 : promesse",
          "Slides 2-5 : étapes",
          "CTA : DM 'SYSTEME'",
        ],
        kpiLabel: "DM SYSTEME",
        durationMin,
        missionType: "content",
        format: "carrousel",
        businessModel: "CONTENT",
      };
    }
    return {
      dayIndex,
      title: "Bilan ambassadeur",
      objective: "Consolider ton message et préparer la suite",
      checklist: [
        "Quel contenu a déclenché le plus de DM ?",
        "Quel mot-clé convertit le mieux ?",
        "Planifier 2 contenus ambassadeur/semaine",
      ],
      kpiLabel: "Commissions",
      durationMin,
      missionType: "content",
      format: "post",
      businessModel: "CONTENT",
    };
  }

  // =========================
  // SEMAINE 4 — PREMIÈRES VENTES (fallback weekIndex >= 4 non gérés au-dessus)
  // =========================
  if (dayIndex === 1) {
    return finalizeDayPlan(weekIndex, dayIndex, {
      dayIndex,
      title: "Offre claire (1 phrase)",
      objective: "Formuler une offre simple qui se vend en DM",
      checklist: [
        "Offre = résultat + pour qui + délai",
        "Ajoute 1 preuve (même petite)",
        "CTA : 'DM OFFRE' si intéressé",
        ...extra("Ajoute 1 garantie", "Ajoute 1 bonus", "Ajoute 1 rareté soft"),
      ],
      kpiLabel: "Offre écrite (oui/non)",
      durationMin,
      missionType: "content",
      format: "post",
      businessModel: "MMR",
    });
  }

  if (dayIndex === 2) {
    return finalizeDayPlan(weekIndex, dayIndex, {
      dayIndex,
      title: "Carrousel “cas client” (preuve)",
      objective: "Publier une preuve simple pour déclencher des demandes",
      checklist: [
        "Avant → après",
        "3 étapes du process",
        "CTA : 'DM CAS' pour détails",
      ],
      kpiLabel: "DM reçus",
      durationMin,
      missionType: "content",
      format: "carrousel",
      businessModel: "CONTENT",
    });
  }

  if (dayIndex === 3) {
    return finalizeDayPlan(weekIndex, dayIndex, {
      dayIndex,
      title: "Closing soft (2 options)",
      objective: "Proposer une décision sans pression",
      checklist: [
        "Option A : ressource / ebook",
        "Option B : accompagnement / MMR",
        "Question : 'Tu veux A ou B ?'",
      ],
      kpiLabel: "Choix obtenus",
      durationMin,
      missionType: "conversation",
      format: "dm_script",
      businessModel: "MMR",
    });
  }

  if (dayIndex === 4) {
    return finalizeDayPlan(weekIndex, dayIndex, {
      dayIndex,
      title: "Story “offre” (3 frames)",
      objective: "Story qui mène à DM (vente douce)",
      checklist: [
        "Frame 1 : problème",
        "Frame 2 : preuve / résultat",
        "Frame 3 : CTA DM",
      ],
      kpiLabel: "Réponses story",
      durationMin,
      missionType: "content",
      format: "story",
      businessModel: "MLR",
    });
  }

  if (dayIndex === 5) {
    return finalizeDayPlan(weekIndex, dayIndex, {
      dayIndex,
      title: "Relance closing (24h)",
      objective: "Relancer 5 prospects chauds proprement",
      checklist: [
        "Relance courte",
        "Rappelle la promesse",
        "Question : 'Tu veux que je t’aide à le mettre en place ?'",
      ],
      kpiLabel: "Réponses relance",
      durationMin,
      missionType: "conversation",
      format: "dm_script",
      businessModel: "MMR",
    });
  }

  if (dayIndex === 6) {
    return finalizeDayPlan(weekIndex, dayIndex, {
      dayIndex,
      title: "2 propositions + 1 micro-urgence",
      objective: "Envoyer 2 propositions avec une échéance soft",
      checklist: [
        "Proposition claire",
        "Bonus/slot limité (soft)",
        "CTA : 'On le fait ensemble ?'",
      ],
      kpiLabel: "Propositions envoyées",
      durationMin,
      missionType: "vente",
      format: "dm_script",
      businessModel: "MMR",
    });
  }

  return finalizeDayPlan(weekIndex, dayIndex, {
    dayIndex,
    title: "Bilan ventes",
    objective: "Consolider ce qui convertit + corriger 1 point",
    checklist: [
      "KPI : DM → qualifs → ventes",
      "Identifie le meilleur levier",
      "Décide 1 amélioration (hook/CTA/closing)",
    ],
    kpiLabel: "KPI semaine (valeur)",
    durationMin: Math.min(durationMin, 35),
    missionType: "content",
    format: "post",
    businessModel: "CONTENT",
  });
}

function targetFromBusinessGoal(goal?: AlexBusinessGoal): { label: string; revenue: number; days: number } {
  switch (goal) {
    case "revenu_500":
      return { label: "Atteindre 500€/mois", revenue: 500, days: 90 };
    case "quitter_job":
      return { label: "Préparer une sortie progressive du salariat", revenue: 2000, days: 180 };
    case "premiers_clients":
      return { label: "Obtenir les premiers clients", revenue: 300, days: 60 };
    case "business_stable":
      return { label: "Construire un business stable", revenue: 1000, days: 120 };
    case "premiers_revenus":
    default:
      return { label: "Obtenir les premiers revenus", revenue: 100, days: 30 };
  }
}

function blockerAdvice(blocker?: AlexMainBlocker): string[] {
  switch (blocker) {
    case "temps":
      return ["ne pas multiplier les réseaux", "ne pas créer de tunnel complexe", "ne pas changer de méthode cette semaine"];
    case "technique":
      return ["ne pas refaire le site", "ne pas installer 5 outils", "ne pas bloquer sur la perfection"];
    case "vente":
      return ["ne pas publier sans CTA", "ne pas éviter les conversations", "ne pas rester uniquement dans le contenu gratuit"];
    case "confiance":
      return ["ne pas viser le post parfait", "ne pas se comparer", "ne pas attendre d’être légitime"];
    case "dispersion":
    default:
      return ["ne pas changer de stratégie", "ne pas ouvrir un nouveau canal", "ne pas consommer plus que tu n’exécutes"];
  }
}

function channelLabel(value?: string): string {
  const raw = String(value || "").trim();
  if (!raw) return "Instagram";

  const normalized = raw.toLowerCase();
  if (normalized.includes("instagram")) return "Instagram";
  if (normalized.includes("facebook")) return "Facebook";
  if (normalized.includes("tiktok")) return "TikTok";
  if (normalized.includes("linkedin")) return "LinkedIn";
  if (normalized.includes("pinterest")) return "Pinterest";

  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function compactText(value: unknown, fallback: string, max = 120): string {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return fallback;
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}...`;
}

function createTrajectory(args: {
  businessGoal?: AlexBusinessGoal;
  businessModel?: AlexBusinessModel;
  audienceSize?: AlexAudienceSize;
  mainBlocker?: AlexMainBlocker;
  offerDescription?: string;
  targetAudienceDescription?: string;
  primaryChannel?: string;
  channelNotes?: string;
}) {
  const target = targetFromBusinessGoal(args.businessGoal);
  const priorityModel: AlexBusinessModel = args.businessModel || "affiliation";
  const offer = compactText(args.offerDescription, "l’offre à clarifier", 100);
  const audience = compactText(args.targetAudienceDescription, "le client idéal", 115);
  const channel = channelLabel(args.primaryChannel || args.channelNotes);
  const blocker = readableBlocker(args.mainBlocker);
  const goal = readableBusinessGoal(args.businessGoal);

  return {
    targetLabel: target.label,
    targetRevenueMonthly: target.revenue,
    horizonDays: target.days,
    priorityChannel: "instagram" as const,
    priorityModel,
    currentStep:
      args.audienceSize === "zero"
        ? `Créer une base de confiance sur ${channel} autour de ${offer} pour ${audience}`
        : `Transformer l’audience existante sur ${channel} en conversations qualifiées autour de ${offer}`,
    forbiddenFocus: blockerAdvice(args.mainBlocker),
    milestones: [
      {
        label: "Clarté",
        objective: `clarifier ${offer}, le message et le profil ${channel} pour parler à ${audience}`,
        weekFrom: 1,
        weekTo: 1,
      },
      {
        label: "Attraction",
        objective: `publier des contenus reliés au problème de ${audience} et à l’objectif : ${goal}`,
        weekFrom: 2,
        weekTo: 4,
      },
      {
        label: "Conversations",
        objective: `ouvrir des DM qualifiés sans forcer la vente, malgré le blocage principal : ${blocker}`,
        weekFrom: 5,
        weekTo: 8,
      },
      {
        label: "Revenus",
        objective: `présenter ${offer} comme une prochaine étape logique aux prospects les plus chauds`,
        weekFrom: 9,
        weekTo: 12,
      },
    ],
  };
}

export function createInitialContext(args: {
  intent: AlexIntent;
  level: AlexLevel;
  timePerDay: TimePerDay;
  businessGoal?: AlexBusinessGoal;
  businessModel?: AlexBusinessModel;
  audienceSize?: AlexAudienceSize;
  mainBlocker?: AlexMainBlocker;
  offerDescription?: string;
  targetAudienceDescription?: string;
  primaryChannel?: string;
  channelNotes?: string;
}): AlexContext {
  const ts = nowISO();
  const trajectory = createTrajectory(args);

  return {
    version: 2,
    intent: args.intent,
    level: args.level,
    timePerDay: args.timePerDay,
    platformLock: "instagram",
    networkProgress: {
      instagram: true,
      facebookUnlocked: false,
      pinterestUnlocked: false,
    },
    businessGoal: args.businessGoal || "premiers_revenus",
    businessModel: args.businessModel || "affiliation",
    audienceSize: args.audienceSize || "moins_500",
    mainBlocker: args.mainBlocker || "dispersion",
    offerDescription: args.offerDescription || "",
    targetAudienceDescription: args.targetAudienceDescription || "",
    primaryChannel: args.primaryChannel || "instagram",
    channelNotes: args.channelNotes || "",
    revenueGoalMonthly: trajectory.targetRevenueMonthly,
    deadlineDays: trajectory.horizonDays,
    trajectory,
    startedAtISO: ts,
    lastUpdatedAtISO: ts,
  };
}


function shortText(value: unknown, fallback: string, max = 95): string {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return fallback;
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}...`;
}

function readableBusinessGoal(goal?: AlexBusinessGoal): string {
  switch (goal) {
    case "revenu_500":
      return "atteindre 500€/mois";
    case "quitter_job":
      return "préparer une sortie progressive du salariat";
    case "premiers_clients":
      return "obtenir tes premiers clients";
    case "business_stable":
      return "construire un business stable";
    case "premiers_revenus":
    default:
      return "obtenir tes premiers revenus";
  }
}

function readableBusinessModel(model?: AlexBusinessModel): string {
  switch (model) {
    case "affiliation":
      return "affiliation";
    case "offre_digitale":
      return "produit digital / formation";
    case "coaching":
      return "coaching / accompagnement";
    case "contenu":
      return "contenu + audience";
    case "pas_encore":
    default:
      return "offre à clarifier";
  }
}

function readableBlocker(blocker?: AlexMainBlocker): string {
  switch (blocker) {
    case "temps":
      return "manque de temps";
    case "technique":
      return "blocage technique";
    case "vente":
      return "difficulté à vendre";
    case "confiance":
      return "manque de confiance";
    case "dispersion":
    default:
      return "dispersion";
  }
}

function contextualizeDayPlan(ctx: AlexContext, weekIndex: number, dayIndex: number, base: DayPlan): DayPlan {
  const offer = shortText(ctx.offerDescription, "ton offre", 90);
  const audience = shortText(ctx.targetAudienceDescription, "ton client idéal", 110);
  const channel = channelLabel(ctx.primaryChannel || ctx.channelNotes);
  const goal = readableBusinessGoal(ctx.businessGoal);
  const model = readableBusinessModel(ctx.businessModel);
  const blocker = readableBlocker(ctx.mainBlocker);

  const hasQuestionnaireContext = Boolean(
    ctx.offerDescription?.trim() ||
      ctx.targetAudienceDescription?.trim() ||
      ctx.businessGoal ||
      ctx.businessModel ||
      ctx.mainBlocker ||
      ctx.primaryChannel ||
      ctx.channelNotes
  );

  if (!hasQuestionnaireContext) return base;

  const commonContextLine = `Contexte Alex : offre = ${offer} ; client idéal = ${audience} ; objectif = ${goal} ; canal = ${channel} ; blocage = ${blocker}.`;

  if (weekIndex === 1 && dayIndex === 1) {
    return {
      ...base,
      title: `### TEST LGD ### ${offer}`
      objective: `Transformer ${offer} en promesse simple pour ${audience}, puis adapter ton profil ${channel} pour attirer des prospects liés à ton objectif : ${goal}.`,
      checklist: [
        `Écris en 1 phrase : “J’aide ${audience} à obtenir un résultat concret grâce à ${offer}”.`,
        `Ajoute cette promesse dans ta bio ou ton profil ${channel}.`,
        `Prépare un CTA simple : “DM LIBERTÉ” ou “commente LIBERTÉ” pour ouvrir la conversation.`,
      ],
      kpiLabel: "Promesse + profil alignés",
      businessModel: base.businessModel,
    };
  }

  if (weekIndex === 1 && dayIndex === 2) {
    return {
      ...base,
      title: `Carrousel problème pour ${audience}`,
      objective: `Créer un carrousel ${channel} qui parle du problème réel de ${audience} et introduit ${offer} sans vendre trop vite.`,
      checklist: [
        `Slide 1 : nomme la douleur principale de ${audience}.`,
        `Slides 2-4 : montre 3 erreurs ou blocages qui empêchent d’avancer.`,
        `Dernière slide : CTA vers un DM pour comprendre si ${offer} peut les aider.`,
      ],
      kpiLabel: "DM / commentaires qualifiés",
      businessModel: base.businessModel,
    };
  }

  if (weekIndex === 1 && dayIndex === 3) {
    return {
      ...base,
      title: `Trouver 10 profils proches de ${audience}`,
      objective: `Identifier des personnes qui ressemblent à ton client idéal et ouvrir 3 échanges naturels autour de leur situation.`,
      checklist: [
        `Trouve 10 profils sur ${channel} qui correspondent à ${audience}.`,
        `Observe leur contenu ou leur bio pour repérer leur besoin réel.`,
        `Envoie 3 messages courts : question + empathie, sans pousser ${offer}.`,
      ],
      kpiLabel: "Conversations qualifiées lancées",
      businessModel: base.businessModel,
    };
  }

  if (weekIndex === 1 && dayIndex === 4) {
    return {
      ...base,
      title: `Story empathie pour ${audience}`,
      objective: `Publier une story qui montre que tu comprends le blocage de ${audience}, surtout autour de : ${blocker}.`,
      checklist: [
        `Story 1 : décris leur situation avec des mots simples.`,
        `Story 2 : explique pourquoi ce blocage est normal.`,
        `Story 3 : propose de répondre en DM pour recevoir une piste concrète.`,
      ],
      kpiLabel: "Réponses story",
      businessModel: base.businessModel,
    };
  }

  if (weekIndex === 1 && dayIndex === 5) {
    return {
      ...base,
      title: `Relancer sans forcer autour de ${offer}`,
      objective: `Relancer 5 prospects chauds en partant de leur besoin, pas d’un message de vente agressif.`,
      checklist: [
        `Liste 5 personnes qui ont réagi à ton contenu ou à tes stories.`,
        `Relance avec 1 phrase utile liée à leur situation.`,
        `Demande simplement si elles veulent que tu leur montres comment ${offer} peut aider.`,
      ],
      kpiLabel: "Réponses relance",
      businessModel: base.businessModel,
    };
  }

  if (weekIndex === 1 && dayIndex === 6) {
    return {
      ...base,
      title: `Présenter ${offer} simplement`,
      objective: `Faire 2 propositions claires à des prospects qualifiés en tenant compte du blocage principal : ${blocker}.`,
      checklist: [
        `Résume leur problème en 1 phrase.`,
        `Présente ${offer} comme la prochaine étape logique.`,
        `Pose une question simple : “tu veux que je t’explique comment ça marche ?”.`,
      ],
      kpiLabel: "Propositions envoyées",
      businessModel: base.businessModel,
    };
  }

  if (weekIndex === 1 && dayIndex === 7) {
    return {
      ...base,
      title: `Bilan : ${offer} + ${audience}`,
      objective: `Mesurer ce qui attire vraiment ${audience} et corriger 1 point avant la semaine suivante.`,
      checklist: [
        `Note le contenu qui a généré le plus de réactions.`,
        `Note le message DM qui a obtenu la meilleure réponse.`,
        `Choisis 1 amélioration : promesse, CTA, profil ou angle de contenu.`,
      ],
      kpiLabel: "Meilleur signal de la semaine",
      businessModel: base.businessModel,
    };
  }

  if (base.missionType === "content") {
    return {
      ...base,
      title: base.format === "carrousel" ? `Carrousel utile pour ${audience}` : `Contenu utile pour ${audience}`,
      objective: `Publier sur ${channel} un contenu relié à ${offer}, au besoin de ${audience} et à ton objectif : ${goal}.`,
      checklist: [
        `Accroche : parle d’un problème concret de ${audience}.`,
        `Corps : donne 1 idée actionnable en lien avec ${offer}.`,
        `CTA : invite à répondre en DM avec un mot-clé simple.`,
      ],
      kpiLabel: "Commentaires / DMs qualifiés",
      businessModel: base.businessModel,
    };
  }

  if (base.missionType === "conversation") {
    return {
      ...base,
      title: `Conversations qualifiées avec ${audience}`,
      objective: `Ouvrir des échanges naturels sur ${channel} avec des prospects proches de ${audience}, sans bloquer sur : ${blocker}.`,
      checklist: [
        `Trouve 10 profils correspondant à ${audience}.`,
        `Interagis avec 3 contenus avant tout message.`,
        `Envoie 3 messages courts basés sur leur situation et non sur une vente directe.`,
      ],
      kpiLabel: "Conversations qualifiées lancées",
      businessModel: base.businessModel,
    };
  }

  if (base.missionType === "vente") {
    return {
      ...base,
      title: `Proposition claire : ${offer}`,
      objective: `Présenter ${offer} à des prospects qualifiés comme une solution logique pour ${audience}.`,
      checklist: [
        `Résume le besoin du prospect en 1 phrase.`,
        `Explique pourquoi ${offer} correspond à sa situation.`,
        `Pose une question de décision simple, sans pression.`,
      ],
      kpiLabel: "Propositions envoyées",
      businessModel: base.businessModel,
    };
  }

  return {
    ...base,
    objective: `${base.objective} ${commonContextLine} Modèle prioritaire : ${model}.`,
    businessModel: base.businessModel,
  };
}

function roadmapLabel(ctx: AlexContext, weekIndex: number): string {
  const offer = shortText(ctx.offerDescription, "offre", 55);
  const audience = shortText(ctx.targetAudienceDescription, "client idéal", 65);
  const channel = channelLabel(ctx.primaryChannel || ctx.channelNotes);

  switch (weekIndex) {
    case 1:
      return `CLARTÉ — ${offer} pour ${audience}`;
    case 2:
      return `ATTRACTION — Contenus ${channel} pour ${audience}`;
    case 3:
      return `CONVERSATIONS — DM qualifiés autour de ${offer}`;
    case 4:
      return `CONVERSION — Première vente de ${offer}`;
    case 5:
      return `STABILISATION — Process contenu → DM → offre`;
    case 6:
      return `PREUVES — Rassurer et convertir ${audience}`;
    case 7:
      return `SCALE — Volume ciblé sur ${channel}`;
    case 8:
      return `SCALE — Optimisation audience + offre`;
    case 9:
      return `AMBASSADOR — Levier LGD soft`;
    default:
      return `PLAN ALEX — ${offer}`;
  }
}

export function createInitialRoadmap(ctx: AlexContext): AlexRoadmap {
  const createdAtISO = nowISO();

  const weeks = [
    {
      weekIndex: 1,
      label: roadmapLabel(ctx, 1),
      days: Array.from({ length: 7 }).map((_, i) => contextualizeDayPlan(ctx, 1, i + 1, dayTemplate(1, i + 1, ctx.intent, ctx.level, ctx.timePerDay))),
    },
    {
      weekIndex: 2,
      label: roadmapLabel(ctx, 2),
      days: Array.from({ length: 7 }).map((_, i) => contextualizeDayPlan(ctx, 2, i + 1, dayTemplate(2, i + 1, ctx.intent, ctx.level, ctx.timePerDay))),
    },
    {
      weekIndex: 3,
      label: roadmapLabel(ctx, 3),
      days: Array.from({ length: 7 }).map((_, i) => contextualizeDayPlan(ctx, 3, i + 1, dayTemplate(3, i + 1, ctx.intent, ctx.level, ctx.timePerDay))),
    },
    {
      weekIndex: 4,
      label: roadmapLabel(ctx, 4),
      days: Array.from({ length: 7 }).map((_, i) => contextualizeDayPlan(ctx, 4, i + 1, dayTemplate(4, i + 1, ctx.intent, ctx.level, ctx.timePerDay))),
    },
    {
      weekIndex: 5,
      label: roadmapLabel(ctx, 5),
      days: Array.from({ length: 7 }).map((_, i) => contextualizeDayPlan(ctx, 5, i + 1, dayTemplate(5, i + 1, ctx.intent, ctx.level, ctx.timePerDay))),
    },
    {
      weekIndex: 6,
      label: roadmapLabel(ctx, 6),
      days: Array.from({ length: 7 }).map((_, i) => contextualizeDayPlan(ctx, 6, i + 1, dayTemplate(6, i + 1, ctx.intent, ctx.level, ctx.timePerDay))),
    },
    {
      weekIndex: 7,
      label: roadmapLabel(ctx, 7),
      days: Array.from({ length: 7 }).map((_, i) => contextualizeDayPlan(ctx, 7, i + 1, dayTemplate(7, i + 1, ctx.intent, ctx.level, ctx.timePerDay))),
    },
    {
      weekIndex: 8,
      label: roadmapLabel(ctx, 8),
      days: Array.from({ length: 7 }).map((_, i) => contextualizeDayPlan(ctx, 8, i + 1, dayTemplate(8, i + 1, ctx.intent, ctx.level, ctx.timePerDay))),
    },
    {
      weekIndex: 9,
      label: roadmapLabel(ctx, 9),
      days: Array.from({ length: 7 }).map((_, i) => contextualizeDayPlan(ctx, 9, i + 1, dayTemplate(9, i + 1, ctx.intent, ctx.level, ctx.timePerDay))),
    },
  ];

  return {
    version: 2,
    createdAtISO,
    weeks,
  };
}

export function buildTodayFromRoadmap(args: { ctx: AlexContext; roadmap: AlexRoadmap; weekIndex: number; dayIndex: number }): AlexToday {
  const { ctx, roadmap, weekIndex, dayIndex } = args;
  const week = roadmap.weeks.find((w) => w.weekIndex === weekIndex) || roadmap.weeks[0];
  const rawDay = week.days.find((d) => d.dayIndex === dayIndex) || week.days[0];
  const day = contextualizeDayPlan(ctx, week.weekIndex, rawDay.dayIndex, rawDay);

  const tone = toneFromIntent(ctx.intent);
  const goal: MissionBrief["goal"] = day.missionType === "vente" ? "convert" : day.missionType === "conversation" ? "engage" : "attract";

  const mission: MissionBrief = {
    platform: "instagram",
    type: day.missionType,
    format: day.format,
    goal,
    businessModel: day.businessModel,
    title: day.title,
    objective: day.objective,
    checklist: day.checklist,
    kpiLabel: day.kpiLabel,
    durationMin: day.durationMin,
    tone,
    editorPayload: {
      platform: "instagram",
      format: day.format,
      missionType: day.missionType,
      businessModel: day.businessModel,
      objective: day.objective,
      checklist: day.checklist,
      kpiLabel: day.kpiLabel,
      tone,
      businessGoal: ctx.businessGoal,
      revenueGoalMonthly: ctx.revenueGoalMonthly,
      deadlineDays: ctx.deadlineDays,
      mainBlocker: ctx.mainBlocker,
      offerDescription: ctx.offerDescription,
      targetAudienceDescription: ctx.targetAudienceDescription,
      primaryChannel: ctx.primaryChannel,
      channelNotes: ctx.channelNotes,
    },
  };

  return {
    version: 2,
    weekIndex: week.weekIndex,
    dayIndex: day.dayIndex,
    mission,
    commitRequired: true,
  };
}

export function evolveContextAfterLog(ctx: AlexContext, args: { done: boolean; kpiValue: number; blocker: string }): AlexContext {
  const next = { ...ctx };
  const ts = nowISO();

  if (!args.done) {
    next.intent = "discipline";
  } else if (args.kpiValue > 0) {
    if (next.intent === "discipline") next.intent = "complement";
  }

  next.lastUpdatedAtISO = ts;
  return next;
}
