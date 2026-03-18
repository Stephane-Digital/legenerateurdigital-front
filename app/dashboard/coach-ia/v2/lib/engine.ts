import type {
  AlexContext,
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

export function createInitialContext(args: { intent: AlexIntent; level: AlexLevel; timePerDay: TimePerDay }): AlexContext {
  const ts = nowISO();
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
    startedAtISO: ts,
    lastUpdatedAtISO: ts,
  };
}

export function createInitialRoadmap(ctx: AlexContext): AlexRoadmap {
  const createdAtISO = nowISO();

  const weeks = [
    {
      weekIndex: 1,
      label: "FIRST_SALE — Préparer l’offre + profil vendeur",
      days: Array.from({ length: 7 }).map((_, i) => dayTemplate(1, i + 1, ctx.intent, ctx.level, ctx.timePerDay)),
    },
    {
      weekIndex: 2,
      label: "FIRST_SALE — Attirer des prospects",
      days: Array.from({ length: 7 }).map((_, i) => dayTemplate(2, i + 1, ctx.intent, ctx.level, ctx.timePerDay)),
    },
    {
      weekIndex: 3,
      label: "FIRST_SALE — Conversations & DM",
      days: Array.from({ length: 7 }).map((_, i) => dayTemplate(3, i + 1, ctx.intent, ctx.level, ctx.timePerDay)),
    },
    {
      weekIndex: 4,
      label: "FIRST_SALE — Closing & 1ère vente",
      days: Array.from({ length: 7 }).map((_, i) => dayTemplate(4, i + 1, ctx.intent, ctx.level, ctx.timePerDay)),
    },
    {
      weekIndex: 5,
      label: "STABILIZE — Process répétable (contenu → DM → offre)",
      days: Array.from({ length: 7 }).map((_, i) => dayTemplate(5, i + 1, ctx.intent, ctx.level, ctx.timePerDay)),
    },
    {
      weekIndex: 6,
      label: "STABILIZE — Système de suivi + preuves",
      days: Array.from({ length: 7 }).map((_, i) => dayTemplate(6, i + 1, ctx.intent, ctx.level, ctx.timePerDay)),
    },
    {
      weekIndex: 7,
      label: "SCALE — Volume (contenu + optimisation)",
      days: Array.from({ length: 7 }).map((_, i) => dayTemplate(7, i + 1, ctx.intent, ctx.level, ctx.timePerDay)),
    },
    {
      weekIndex: 8,
      label: "SCALE — Multiplication (audience + offres)",
      days: Array.from({ length: 7 }).map((_, i) => dayTemplate(8, i + 1, ctx.intent, ctx.level, ctx.timePerDay)),
    },
    {
      weekIndex: 9,
      label: "AMBASSADOR — Ambassadeur LGD (affiliation 60%)",
      days: Array.from({ length: 7 }).map((_, i) => dayTemplate(9, i + 1, ctx.intent, ctx.level, ctx.timePerDay)),
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
  const day = week.days.find((d) => d.dayIndex === dayIndex) || week.days[0];

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
