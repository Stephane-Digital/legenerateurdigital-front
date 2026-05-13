"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LayerData } from "../v5/types/layers";
import EditorLayout from "../v5/ui/EditorLayout";
import SchedulePlannerModal from "../ui/SchedulePlannerModal";
import useSchedulePlanner from "../v5/hooks/useSchedulePlanner";
import { renderEditorCreationToDataUrl } from "../utils/downloadEditorCreation";

interface Props {
  mobileToolsOpen?: boolean;
  onCloseMobileTools?: () => void;

  // ✅ Coach brief (Alex V2) — optional
  brief?: string;

  // ✅ sauvegarde locale / dirty
  onDirtyChange?: (dirty: boolean) => void;
  onSnapshot?: (snapshot: { ui?: any; layers: LayerData[] }) => void;
}

const LS_POST = "lgd_editor_post_draft_v5";
const LS_COPILOT_OPEN = "lgd_editor_copilot_open";

// Brief banner dismissed (per user)
const LS_BRIEF_DISMISSED = "lgd_editor_brief_dismissed";

/** =========================
 *  IA Copilot (SAFE / texte-only)
 *  - utilise /ai/text/rewrite existant
 *  - ne touche PAS au moteur canvas
 *  ========================= */

type Network = "Instagram" | "TikTok" | "LinkedIn" | "Facebook";
type Objective = "Attirer" | "Éduquer" | "Convertir" | "Story";
type Angle =
  | "MRR débutant"
  | "Produit digital"
  | "Objection"
  | "Storytelling"
  | "Preuve"
  | "Tutoriel"
  | "Erreur fréquente"
  | "Mindset / discipline";


type SocialPromptTemplate = {
  id: string;
  category: string;
  title: string;
  description: string;
  idea: string;
  network: Network;
  objective: Objective;
  angle: Angle;
  tone: string;
  maxChars: number;
};

const SOCIAL_PROMPT_LIBRARY: SocialPromptTemplate[] = [
  {
    "id": "hook-interruption",
    "category": "Hooks psychologiques",
    "title": "Interruption pattern",
    "description": "Casser le scroll avec une phrase qui surprend sans faire putaclic.",
    "idea": "Crée un post qui interrompt le scroll dès la première ligne. Le contenu doit montrer que le vrai problème n'est pas le manque d'informations, mais le manque d'ordre et d'exécution. Termine par un CTA doux qui invite à sauvegarder ou commenter.",
    "network": "Instagram",
    "objective": "Attirer",
    "angle": "Objection",
    "tone": "premium, direct, lucide, anti-blabla, orienté déclic",
    "maxChars": 900
  },
  {
    "id": "hook-verite-derangeante",
    "category": "Hooks psychologiques",
    "title": "Vérité dérangeante",
    "description": "Dire une vérité marketing que l'audience sent déjà mais n'ose pas formuler.",
    "idea": "Crée un post autour d'une vérité dérangeante : beaucoup de personnes n'ont pas besoin d'une nouvelle stratégie, mais d'appliquer une seule action simple. Le ton doit être respectueux, ferme et premium.",
    "network": "LinkedIn",
    "objective": "Attirer",
    "angle": "Erreur fréquente",
    "tone": "expert, premium, franc, sans jugement",
    "maxChars": 1100
  },
  {
    "id": "hook-frustration",
    "category": "Hooks psychologiques",
    "title": "Frustration silencieuse",
    "description": "Transformer une frustration quotidienne en accroche engageante.",
    "idea": "Crée un post qui parle à une personne frustrée de consommer du contenu business sans avancer. Ouvre par une phrase très reconnaissable, puis explique le blocage avec empathie et termine sur une action simple.",
    "network": "Instagram",
    "objective": "Attirer",
    "angle": "MRR débutant",
    "tone": "empathique, concret, premium, orienté action",
    "maxChars": 1000
  },
  {
    "id": "hook-curiosite",
    "category": "Hooks psychologiques",
    "title": "Curiosité stratégique",
    "description": "Créer une tension de curiosité sans promesse magique.",
    "idea": "Crée un post qui donne envie de lire jusqu'au bout avec une promesse claire : comprendre pourquoi une méthode simple exécutée vaut mieux que dix idées accumulées. Le contenu doit rester crédible et orienté marketing digital.",
    "network": "Instagram",
    "objective": "Attirer",
    "angle": "Produit digital",
    "tone": "curieux, premium, structuré, crédible",
    "maxChars": 1000
  },
  {
    "id": "hook-aspiration",
    "category": "Hooks psychologiques",
    "title": "Aspiration crédible",
    "description": "Faire rêver sans tomber dans le revenu magique.",
    "idea": "Crée un post qui montre une aspiration réaliste : reprendre de la clarté, publier avec intention, construire une première action marketing concrète. Pas de promesse de richesse rapide.",
    "network": "Facebook",
    "objective": "Attirer",
    "angle": "Mindset / discipline",
    "tone": "inspirant, réaliste, humain, premium",
    "maxChars": 1000
  },
  {
    "id": "hook-erreur",
    "category": "Hooks psychologiques",
    "title": "Erreur fréquente",
    "description": "Transformer une erreur en prise de conscience utile.",
    "idea": "Crée un post sur l'erreur de vouloir tout comprendre avant d'agir. Montre pourquoi cette logique bloque l'exécution, puis propose une prochaine étape simple.",
    "network": "Instagram",
    "objective": "Éduquer",
    "angle": "Erreur fréquente",
    "tone": "pédagogique, lucide, premium, actionnable",
    "maxChars": 1000
  },
  {
    "id": "hook-confession",
    "category": "Hooks psychologiques",
    "title": "Confession marketing",
    "description": "Utiliser un angle confession pour créer proximité et confiance.",
    "idea": "Crée un post style confession professionnelle : 'j'ai longtemps cru que...' puis montre une prise de conscience liée au marketing digital, aux contenus ou aux offres. Termine par un CTA engagement.",
    "network": "Facebook",
    "objective": "Story",
    "angle": "Storytelling",
    "tone": "authentique, sobre, premium, humain",
    "maxChars": 1200
  },
  {
    "id": "hook-anti-mythe",
    "category": "Hooks psychologiques",
    "title": "Anti-mythe social media",
    "description": "Démonter une fausse croyance sans agressivité.",
    "idea": "Crée un post qui démonte le mythe : il faut publier tous les jours pour vendre. Explique que la clarté du message, l'angle et l'appel à l'action comptent davantage que la quantité.",
    "network": "LinkedIn",
    "objective": "Éduquer",
    "angle": "Preuve",
    "tone": "expert, calme, premium, anti-bullshit",
    "maxChars": 1200
  },
  {
    "id": "hook-tension-cognitive",
    "category": "Hooks psychologiques",
    "title": "Tension cognitive",
    "description": "Opposer deux idées pour déclencher la lecture.",
    "idea": "Crée un post basé sur une tension : plus on accumule de conseils, moins on agit. Explique pourquoi cela arrive et comment reprendre une action claire.",
    "network": "Instagram",
    "objective": "Attirer",
    "angle": "Objection",
    "tone": "lucide, premium, psychologique, concret",
    "maxChars": 1000
  },
  {
    "id": "hook-avant-apres",
    "category": "Hooks psychologiques",
    "title": "Contraste avant/après",
    "description": "Montrer le passage de la confusion à l'action.",
    "idea": "Crée un post avant/après : avant, l'audience saute d'une idée à l'autre ; après, elle suit une action simple avec un objectif clair. Le rendu doit être visuel et facile à lire.",
    "network": "Instagram",
    "objective": "Attirer",
    "angle": "Tutoriel",
    "tone": "clair, visuel, premium, structuré",
    "maxChars": 1000
  },
  {
    "id": "engagement-commentaire",
    "category": "Psychologie & engagement",
    "title": "Commentaire intelligent",
    "description": "Faire commenter sans question basique.",
    "idea": "Crée un post qui pousse les lecteurs à commenter leur principal blocage business sans les mettre mal à l'aise. La question finale doit être simple, humaine et utile pour qualifier les prospects.",
    "network": "Instagram",
    "objective": "Attirer",
    "angle": "Objection",
    "tone": "humain, engageant, premium, sans jugement",
    "maxChars": 900
  },
  {
    "id": "engagement-debat-soft",
    "category": "Psychologie & engagement",
    "title": "Débat intelligent",
    "description": "Créer une discussion sans polémique cheap.",
    "idea": "Crée un post qui lance un débat soft : faut-il apprendre plus ou exécuter mieux ? Le post doit rester respectueux et inviter à partager son avis.",
    "network": "LinkedIn",
    "objective": "Attirer",
    "angle": "Preuve",
    "tone": "expert, nuancé, premium, engageant",
    "maxChars": 1100
  },
  {
    "id": "engagement-validation",
    "category": "Psychologie & engagement",
    "title": "Validation émotionnelle",
    "description": "Faire sentir au lecteur qu'il n'est pas seul.",
    "idea": "Crée un post qui valide la fatigue mentale des personnes qui essaient de construire un business digital après plusieurs formations. Pas de culpabilisation, juste une reconnaissance précise puis une action simple.",
    "network": "Facebook",
    "objective": "Story",
    "angle": "MRR débutant",
    "tone": "empathique, profond, premium, rassurant",
    "maxChars": 1200
  },
  {
    "id": "engagement-miroir",
    "category": "Psychologie & engagement",
    "title": "Miroir psychologique",
    "description": "Décrire exactement le comportement du prospect.",
    "idea": "Crée un post miroir : ouvrir plusieurs onglets, sauvegarder des contenus, prendre des notes, puis repousser l'action. Termine par un CTA qui invite à identifier sa première action.",
    "network": "Instagram",
    "objective": "Attirer",
    "angle": "Storytelling",
    "tone": "précis, humain, premium, très concret",
    "maxChars": 1000
  },
  {
    "id": "engagement-appartenance",
    "category": "Psychologie & engagement",
    "title": "Appartenance",
    "description": "Créer un sentiment de communauté autour d'un problème commun.",
    "idea": "Crée un post qui rassemble les personnes qui veulent construire un business digital sans se perdre dans les promesses faciles. Le ton doit créer confiance et appartenance.",
    "network": "Facebook",
    "objective": "Story",
    "angle": "Produit digital",
    "tone": "communautaire, premium, sincère, fédérateur",
    "maxChars": 1100
  },
  {
    "id": "engagement-choix",
    "category": "Psychologie & engagement",
    "title": "Choix impossible",
    "description": "Faire réagir sur une décision stratégique simple.",
    "idea": "Crée un post qui demande au lecteur de choisir entre deux priorités : créer plus de contenu ou clarifier son offre. Explique pourquoi ce choix révèle souvent le vrai blocage.",
    "network": "LinkedIn",
    "objective": "Éduquer",
    "angle": "Objection",
    "tone": "stratégique, premium, engageant, clair",
    "maxChars": 1100
  },
  {
    "id": "authority-framework",
    "category": "Autorité / expertise",
    "title": "Framework expert",
    "description": "Présenter une méthode simple et mémorisable.",
    "idea": "Crée un post d'autorité qui présente un framework en 3 étapes pour transformer une idée en contenu qui attire, éduque et convertit. Le ton doit être expert mais accessible.",
    "network": "LinkedIn",
    "objective": "Éduquer",
    "angle": "Tutoriel",
    "tone": "expert, premium, pédagogique, structuré",
    "maxChars": 1300
  },
  {
    "id": "authority-cas-client",
    "category": "Autorité / expertise",
    "title": "Mini étude de cas",
    "description": "Montrer une transformation sans inventer de chiffres irréalistes.",
    "idea": "Crée un post type mini étude de cas fictive et crédible : une personne dispersée clarifie son message, crée un contenu utile et obtient plus d'engagement qualifié. Pas de chiffre magique.",
    "network": "LinkedIn",
    "objective": "Éduquer",
    "angle": "Preuve",
    "tone": "crédible, premium, concret, orienté preuve",
    "maxChars": 1300
  },
  {
    "id": "authority-coulisses",
    "category": "Autorité / expertise",
    "title": "Coulisses stratégie",
    "description": "Montrer comment réfléchir comme un marketeur.",
    "idea": "Crée un post coulisses qui montre comment choisir un angle de contenu avant de publier : audience, douleur, croyance, CTA. Le lecteur doit apprendre une vraie logique marketing.",
    "network": "Instagram",
    "objective": "Éduquer",
    "angle": "Tutoriel",
    "tone": "expert, clair, premium, utile",
    "maxChars": 1200
  },
  {
    "id": "authority-erreur-client",
    "category": "Autorité / expertise",
    "title": "Erreur client fréquente",
    "description": "Montrer une erreur sans rabaisser l'audience.",
    "idea": "Crée un post expliquant une erreur fréquente : parler de son outil au lieu de parler du problème du prospect. Donne une correction simple et actionnable.",
    "network": "LinkedIn",
    "objective": "Éduquer",
    "angle": "Erreur fréquente",
    "tone": "pédagogique, premium, direct, bienveillant",
    "maxChars": 1200
  },
  {
    "id": "authority-positionnement",
    "category": "Autorité / expertise",
    "title": "Positionnement premium",
    "description": "Clarifier pourquoi un bon message vaut mieux qu'un joli visuel.",
    "idea": "Crée un post d'autorité qui explique que le design attire, mais que le message convertit. Fais le lien avec l'importance du hook, du problème, de la promesse et du CTA.",
    "network": "Instagram",
    "objective": "Éduquer",
    "angle": "Preuve",
    "tone": "premium, expert, clair, orienté conversion",
    "maxChars": 1200
  },
  {
    "id": "conversion-dm",
    "category": "Conversion douce",
    "title": "CTA DM naturel",
    "description": "Amener vers le DM sans forcing.",
    "idea": "Crée un post qui donne envie d'envoyer un DM pour obtenir une ressource ou un diagnostic. Le CTA doit être doux, humain et précis.",
    "network": "Instagram",
    "objective": "Convertir",
    "angle": "Produit digital",
    "tone": "humain, premium, orienté confiance, soft sell",
    "maxChars": 1000
  },
  {
    "id": "conversion-commentaire",
    "category": "Conversion douce",
    "title": "CTA commentaire qualifiant",
    "description": "Faire commenter un mot-clé utile.",
    "idea": "Crée un post qui mène naturellement vers un commentaire mot-clé. Le mot-clé doit être lié à une ressource gratuite ou un plan d'action clair.",
    "network": "Instagram",
    "objective": "Convertir",
    "angle": "MRR débutant",
    "tone": "direct, premium, simple, non agressif",
    "maxChars": 1000
  },
  {
    "id": "conversion-lead-magnet",
    "category": "Conversion douce",
    "title": "Lead magnet social",
    "description": "Transformer un post en capture indirecte de leads.",
    "idea": "Crée un post qui vend l'envie de recevoir un guide gratuit. Le contenu doit montrer le problème, la micro-transformation du guide et finir par un CTA clair.",
    "network": "Facebook",
    "objective": "Convertir",
    "angle": "Produit digital",
    "tone": "conversion douce, premium, clair, rassurant",
    "maxChars": 1100
  },
  {
    "id": "conversion-soft-sell",
    "category": "Conversion douce",
    "title": "Vente douce",
    "description": "Parler d'une offre sans vendre frontalement.",
    "idea": "Crée un post de vente douce qui explique pourquoi une personne bloquée a besoin d'un chemin guidé plutôt que d'un outil IA brut. Respecte les autres outils, mais différencie LGD.",
    "network": "LinkedIn",
    "objective": "Convertir",
    "angle": "Objection",
    "tone": "respectueux, premium, stratégique, crédible",
    "maxChars": 1300
  },
  {
    "id": "conversion-transition-offre",
    "category": "Conversion douce",
    "title": "Transition vers offre",
    "description": "Faire passer d'un contenu éducatif à une prochaine étape logique.",
    "idea": "Crée un post qui commence par une idée éducative, puis amène naturellement vers une offre ou une ressource. La transition doit être fluide et non commerciale agressive.",
    "network": "Instagram",
    "objective": "Convertir",
    "angle": "Tutoriel",
    "tone": "fluide, premium, utile, orienté action",
    "maxChars": 1100
  },
  {
    "id": "carousel-mini-plan",
    "category": "Carrousel premium",
    "title": "Mini-plan 5 slides",
    "description": "Créer un carrousel clair et actionnable.",
    "idea": "Crée une structure de carrousel en 5 slides pour aider une personne dispersée à reprendre une action marketing claire cette semaine. Une idée forte par slide, CTA final simple.",
    "network": "Instagram",
    "objective": "Éduquer",
    "angle": "Tutoriel",
    "tone": "clair, premium, structuré, actionnable",
    "maxChars": 1400
  },
  {
    "id": "carousel-erreur-solution",
    "category": "Carrousel premium",
    "title": "Erreur → solution",
    "description": "Transformer une erreur en progression slide par slide.",
    "idea": "Crée un carrousel : slide 1 hook, slide 2 erreur, slide 3 conséquence, slide 4 correction, slide 5 action. Sujet : consommer trop de contenu sans agir.",
    "network": "Instagram",
    "objective": "Éduquer",
    "angle": "Erreur fréquente",
    "tone": "pédagogique, visuel, premium, concret",
    "maxChars": 1400
  },
  {
    "id": "carousel-avant-apres",
    "category": "Carrousel premium",
    "title": "Avant / après",
    "description": "Visualiser une transformation simple.",
    "idea": "Crée un carrousel avant/après sur la différence entre une personne qui empile des idées et une personne qui suit un plan marketing simple. CTA final vers guide gratuit.",
    "network": "Instagram",
    "objective": "Convertir",
    "angle": "Preuve",
    "tone": "premium, clair, motivant, réaliste",
    "maxChars": 1400
  },
  {
    "id": "carousel-storytelling",
    "category": "Carrousel premium",
    "title": "Storytelling carrousel",
    "description": "Créer une histoire courte en slides.",
    "idea": "Crée un carrousel storytelling sur une personne qui pense avoir besoin d'une nouvelle formation, puis comprend qu'elle a surtout besoin d'un ordre d'action clair.",
    "network": "Instagram",
    "objective": "Story",
    "angle": "Storytelling",
    "tone": "narratif, empathique, premium, déclic",
    "maxChars": 1500
  },
  {
    "id": "carousel-framework",
    "category": "Carrousel premium",
    "title": "Framework 5 étapes",
    "description": "Créer une structure mémorisable.",
    "idea": "Crée un carrousel avec un framework en 5 étapes : attirer, clarifier, structurer, publier, convertir. Chaque slide doit être courte et utile.",
    "network": "Instagram",
    "objective": "Éduquer",
    "angle": "Tutoriel",
    "tone": "expert, premium, structuré, mémorisable",
    "maxChars": 1500
  },
  {
    "id": "persona-salarie",
    "category": "Personas marketing",
    "title": "Salarié épuisé",
    "description": "Parler à une personne qui veut avancer sans tout quitter.",
    "idea": "Crée un post pour un salarié fatigué qui veut construire une activité digitale progressivement, sans quitter son travail du jour au lendemain. Ton réaliste et rassurant.",
    "network": "Facebook",
    "objective": "Convertir",
    "angle": "Mindset / discipline",
    "tone": "empathique, premium, réaliste, sans promesse magique",
    "maxChars": 1100
  },
  {
    "id": "persona-parent",
    "category": "Personas marketing",
    "title": "Parent débordé",
    "description": "Parler à un parent qui manque de temps.",
    "idea": "Crée un post pour un parent qui veut avancer dans le digital malgré peu de temps, de la fatigue et beaucoup de responsabilités. Mets l'accent sur une action courte et claire.",
    "network": "Instagram",
    "objective": "Convertir",
    "angle": "Storytelling",
    "tone": "humain, premium, concret, encourageant",
    "maxChars": 1100
  },
  {
    "id": "persona-coach",
    "category": "Personas marketing",
    "title": "Coach débutant",
    "description": "Aider un coach à publier sans se sentir illégitime.",
    "idea": "Crée un post pour un coach débutant qui a peur de publier parce qu'il ne se sent pas assez expert. Montre comment partager une idée utile sans prétendre tout savoir.",
    "network": "LinkedIn",
    "objective": "Éduquer",
    "angle": "Objection",
    "tone": "rassurant, premium, expert, humain",
    "maxChars": 1200
  },
  {
    "id": "persona-entrepreneur-bloque",
    "category": "Personas marketing",
    "title": "Entrepreneur bloqué",
    "description": "Parler à un entrepreneur qui réfléchit trop.",
    "idea": "Crée un post pour un entrepreneur qui a une offre, des idées et des outils, mais qui reste bloqué par manque de priorité. Le post doit l'aider à choisir une première action.",
    "network": "LinkedIn",
    "objective": "Convertir",
    "angle": "Produit digital",
    "tone": "stratégique, premium, direct, utile",
    "maxChars": 1200
  },
  {
    "id": "persona-freelance",
    "category": "Personas marketing",
    "title": "Freelance invisible",
    "description": "Aider un freelance à créer un contenu qui attire des prospects.",
    "idea": "Crée un post pour un freelance qui sait faire son métier mais ne sait pas comment se rendre visible sans se vendre lourdement. Angle : contenu utile + preuve + CTA doux.",
    "network": "LinkedIn",
    "objective": "Convertir",
    "angle": "Preuve",
    "tone": "professionnel, premium, concret, non agressif",
    "maxChars": 1200
  },
  {
    "id": "persona-mrr",
    "category": "Personas marketing",
    "title": "MRR / affiliation bloqué",
    "description": "Parler aux acheteurs de formations sans résultat.",
    "idea": "Crée un post pour une personne qui a acheté des formations MRR, affiliation ou IA, mais qui n'a pas encore de système simple pour agir. Reconnais la fatigue et propose une étape claire.",
    "network": "Instagram",
    "objective": "Convertir",
    "angle": "MRR débutant",
    "tone": "empathique, direct, premium, anti-bullshit",
    "maxChars": 1100
  },
  {
    "id": "persona-createur",
    "category": "Personas marketing",
    "title": "Créateur de contenu dispersé",
    "description": "Aider un créateur à arrêter de poster au hasard.",
    "idea": "Crée un post pour un créateur qui publie sans stratégie claire. Explique la différence entre poster pour exister et publier pour construire une relation puis convertir.",
    "network": "Instagram",
    "objective": "Éduquer",
    "angle": "Produit digital",
    "tone": "clair, premium, stratégique, actionnable",
    "maxChars": 1100
  },
  {
    "id": "persona-audience-froide",
    "category": "Personas marketing",
    "title": "Audience froide",
    "description": "Créer un contenu pour des gens qui ne connaissent pas encore l'offre.",
    "idea": "Crée un post pour audience froide : ne vends pas tout de suite. Commence par une douleur précise, crée de la confiance et propose une ressource ou une action simple.",
    "network": "Facebook",
    "objective": "Attirer",
    "angle": "Objection",
    "tone": "pédagogique, premium, doux, accessible",
    "maxChars": 1100
  },
  {
    "id": "strategy-nurturing",
    "category": "Stratégie contenu",
    "title": "Nurturing audience",
    "description": "Créer un post qui nourrit la confiance avant la vente.",
    "idea": "Crée un post de nurturing qui aide l'audience à comprendre son blocage sans vendre immédiatement. Le contenu doit augmenter la confiance et préparer une future conversion.",
    "network": "Instagram",
    "objective": "Éduquer",
    "angle": "Preuve",
    "tone": "stratégique, premium, patient, utile",
    "maxChars": 1200
  },
  {
    "id": "strategy-autorite-long-terme",
    "category": "Stratégie contenu",
    "title": "Autorité long terme",
    "description": "Installer une expertise durable.",
    "idea": "Crée un post qui installe l'autorité sur le long terme : expliquer une idée simple mais profonde que l'audience peut réutiliser. Pas de buzzword, pas d'exagération.",
    "network": "LinkedIn",
    "objective": "Éduquer",
    "angle": "Preuve",
    "tone": "expert, posé, premium, durable",
    "maxChars": 1300
  },
  {
    "id": "strategy-acquisition",
    "category": "Stratégie contenu",
    "title": "Acquisition audience",
    "description": "Créer un contenu qui attire de nouvelles personnes qualifiées.",
    "idea": "Crée un post d'acquisition pour attirer des personnes intéressées par le marketing digital, l'IA et les revenus complémentaires, sans promesse irréaliste.",
    "network": "Instagram",
    "objective": "Attirer",
    "angle": "Produit digital",
    "tone": "accessible, premium, clair, orienté audience",
    "maxChars": 1100
  },
  {
    "id": "strategy-conversion-organique",
    "category": "Stratégie contenu",
    "title": "Conversion organique",
    "description": "Transformer l'attention en prochaine action.",
    "idea": "Crée un post qui transforme une prise de conscience en action organique : sauvegarde, commentaire, DM ou inscription à un guide. Le CTA doit être naturel.",
    "network": "Instagram",
    "objective": "Convertir",
    "angle": "Objection",
    "tone": "conversion douce, premium, clair, orienté action",
    "maxChars": 1100
  },
  {
    "id": "strategy-relationnel",
    "category": "Stratégie contenu",
    "title": "Contenu relationnel",
    "description": "Créer proximité et confiance sans vendre.",
    "idea": "Crée un post relationnel qui montre une compréhension fine du quotidien de l'audience : fatigue, doutes, surcharge d'idées. Termine par une question simple et humaine.",
    "network": "Facebook",
    "objective": "Story",
    "angle": "Storytelling",
    "tone": "humain, premium, relationnel, empathique",
    "maxChars": 1200
  }
];

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
}

function systemePlansUrl() {
  return (
    process.env.NEXT_PUBLIC_SYSTEME_PLANS_URL ||
    "https://legenerateurdigital.systeme.io/plans"
  ).trim();
}

function openPlans() {
  if (typeof window === "undefined") return;
  const url = systemePlansUrl();
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}

function isQuotaError(msg: string) {
  const m = (msg || "").toLowerCase();
  return m.includes("quota") || m.includes("plan") || m.includes("systeme");
}

function getAuthHeaders() {
  if (typeof window === "undefined") return {};
  const token =
    window.localStorage.getItem("access_token") ||
    window.localStorage.getItem("token") ||
    window.localStorage.getItem("jwt") ||
    "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function estimateTokens(text: string) {
  const t = (text || "").trim();
  if (!t) return 1;
  // estimation très simple (≈ 1 token ~ 4 caractères)
  return Math.max(1, Math.ceil(t.length / 4));
}

async function consumeCoachQuota(amount: number) {
  const base = apiBase();
  if (!base) return;
  const a = Math.max(1, Math.trunc(Number(amount) || 1));
  const res = await fetch(`${base}/ai-quota/consume?amount=${a}&feature=coach`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
    },
    credentials: "include",
  });

  if (!res.ok) {
    let detail = "";
    try {
      const j = await res.json();
      detail = j?.detail || j?.message || "";
    } catch {
      // ignore
    }

    if (res.status === 400) {
      throw new Error(detail || "Quota insuffisant. Veuillez changer de plan.");
    }

    throw new Error(detail || `Erreur IA-Quotas (HTTP ${res.status})`);
  }
}

async function aiRewriteText(args: { text: string; tone?: string; max_length?: number }) {
  const base = apiBase();
  if (!base) throw new Error("NEXT_PUBLIC_API_URL manquant");

  const res = await fetch(`${base}/ai/text/rewrite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify({
      text: args.text,
      tone: args.tone || undefined,
      max_length: args.max_length && args.max_length > 0 ? args.max_length : undefined,
    }),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const j = await res.json();
      detail = j?.detail || j?.message || "";
    } catch {
      // ignore
    }
    throw new Error(detail || `IA indisponible (HTTP ${res.status})`);
  }

  const data = await res.json().catch(() => ({} as any));
  const out = data?.result ?? data?.text ?? data?.output ?? "";
  if (!out || typeof out !== "string") throw new Error("Réponse IA invalide");

  // IMPORTANT : on consomme AVANT de livrer.
  // Si quota dépassé (400), on stoppe et l'UI affiche l'erreur (pas de livraison gratuite).
  await consumeCoachQuota(estimateTokens(args.text) + estimateTokens(out));

  return out;
}

function safeJsonParse(raw: string | null) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function stableSig(value: any) {
  try {
    return JSON.stringify(value ?? null);
  } catch {
    return "";
  }
}

/**
 * ✅ MICRO PATCH anti-loop
 * On nettoie l'UI qui remonte de l'éditeur (runtime/konva/dom refs)
 * pour éviter un "ui" différent à chaque render => setState loop.
 */
function stripNonSerializableUI(input: any): any {
  if (input == null) return input;
  const t = typeof input;
  if (t === "function") return undefined;
  if (t !== "object") return input;

  // DOM nodes
  const anyObj: any = input as any;
  if (anyObj?.nodeType === 1 || anyObj?.tagName || anyObj?.nodeName) return undefined;

  if (Array.isArray(input)) {
    return input
      .map((x) => stripNonSerializableUI(x))
      .filter((x) => x !== undefined);
  }

  const out: any = {};
  for (const [k, v] of Object.entries(anyObj)) {
    if (v === undefined) continue;

    // drop common runtime keys
    if (k === "runtime" || k === "_runtime" || k === "__runtime") continue;
    if (k === "konva" || k === "_konva" || k === "__konva") continue;
    if (k === "stage" || k === "layer" || k === "node" || k === "ref") continue;
    if (k === "imageElement" || k === "imgEl" || k === "htmlImage") continue;

    const cleaned = stripNonSerializableUI(v);
    if (cleaned !== undefined) out[k] = cleaned;
  }
  return out;
}

function clip(s: string, n = 42) {
  const t = (s || "").replace(/\s+/g, " ").trim();
  if (t.length <= n) return t;
  return t.slice(0, n - 1) + "…";
}

/** =========================
 *  Coach → Copilot (non-destructif)
 *  - inférences locales, zéro backend
 *  - n'écrase jamais si l'utilisateur a déjà modifié
 *  ========================= */
function normalizeBriefSig(b: string) {
  return (b || "").replace(/\s+/g, " ").trim();
}

function inferObjectiveFromBrief(brief: string): Objective {
  const b = (brief || "").toLowerCase();

  // Convertir (vente / DM / inscription / offre)
  if (
    /\b(vendre|vente|acheter|commande|panier|promo|promotion|offre|prix|tarif|inscription|inscris|réserve|rdv|appel|dm|message)\b/.test(b) ||
    /\b(convert|conversion|closing|close)\b/.test(b)
  ) {
    return "Convertir";
  }

  // Éduquer (tuto / étapes / guide)
  if (/\b(tuto|tutoriel|comment|étapes|etapes|guide|méthode|checklist|process|processus)\b/.test(b)) {
    return "Éduquer";
  }

  // Story (histoire / parcours / avant-après)
  if (/\b(story|histoire|parcours|avant\s*\/\s*après|avant-après|avant apres|mon expérience|mon experience)\b/.test(b)) {
    return "Story";
  }

  return "Attirer";
}

function inferAngleFromBrief(brief: string): Angle {
  const b = (brief || "").toLowerCase();

  if (/\b(trop\s*cher|pas\s*le\s*temps|je\s*(pense|crois)|peur|objection|bloqué|bloque|doute)\b/.test(b)) {
    return "Objection";
  }
  if (/\b(preuve|résultat|resultat|chiffre|cas\s*client|témoignage|temoignage|avant\s*\/\s*après|avant-après)\b/.test(b)) {
    return "Preuve";
  }
  if (/\b(tuto|tutoriel|étapes|etapes|checklist|process|processus)\b/.test(b)) {
    return "Tutoriel";
  }
  if (/\b(story|histoire|parcours)\b/.test(b)) {
    return "Storytelling";
  }
  if (/\b(erreur|à\s*éviter|a\s*eviter|ne\s*fait\s*pas|stop|piège|piege)\b/.test(b)) {
    return "Erreur fréquente";
  }
  if (/\b(mindset|discipline|habitude|routine|procrast|procrastination|motivation)\b/.test(b)) {
    return "Mindset / discipline";
  }

  if (/\bmrr\b/.test(b)) return "MRR débutant";
  return "Produit digital";
}


const FONT_STYLESHEET_IDS: Record<string, string> = {
  inter: "lgd-font-inter",
  lora: "lgd-font-lora",
  oswald: "lgd-font-oswald",
  montserrat: "lgd-font-montserrat",
  merriweather: "lgd-font-merriweather",
  roboto: "lgd-font-roboto",
  "playfair display": "lgd-font-playfair-display",
};

function getFontKey(font?: string) {
  return String(font || "")
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function getFontImportCss(font?: string) {
  const key = getFontKey(font);
  const map: Record<string, string> = {
    inter: "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap');",
    lora: "@import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap');",
    oswald: "@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap');",
    montserrat: "@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');",
    merriweather: "@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap');",
    roboto: "@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap');",
    "playfair display": "@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap');",
  };
  return map[key] || "";
}

function ensureFontStylesheetLoaded(font?: string) {
  if (typeof document === "undefined") return;
  const key = getFontKey(font);
  const css = getFontImportCss(font);
  if (!css) return;
  const id = FONT_STYLESHEET_IDS[key] || `lgd-font-${key}`;
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
}


function estimateSocialTextHeight({
  text,
  width,
  fontSize,
  fontFamily,
  lineHeight,
}: {
  text: string;
  width: number;
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
}) {
  const safeText = String(text ?? "");
  const safeWidth = Math.max(120, Math.round(width || 0));
  const safeFontSize = Math.max(10, Number(fontSize || 24));
  const safeLineHeight = Math.max(0.8, Number(lineHeight || 1.2));
  const horizontalPadding = 24;
  const innerWidth = Math.max(40, safeWidth - horizontalPadding);

  const measureWithCanvas = () => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.font = `${safeFontSize}px ${fontFamily || "Inter"}`;
    const paragraphs = safeText.split("\n");
    let lines = 0;

    for (const paragraph of paragraphs) {
      const words = String(paragraph || "").split(/\s+/).filter(Boolean);
      if (!words.length) {
        lines += 1;
        continue;
      }

      let current = "";
      for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        const candidateWidth = ctx.measureText(candidate).width;
        if (candidateWidth <= innerWidth || !current) {
          current = candidate;
          continue;
        }
        lines += 1;
        current = word;
      }
      if (current) lines += 1;
    }

    return Math.max(1, lines);
  };

  const measuredLines = measureWithCanvas();
  const approxLines = measuredLines ?? Math.max(1, Math.ceil((safeText.length * safeFontSize * 0.58) / innerWidth));
  const verticalPadding = 24;
  return Math.max(48, Math.ceil(approxLines * safeFontSize * safeLineHeight + verticalPadding));
}

type SocialCopilotBlock = {
  role: "hook" | "body" | "cta";
  text: string;
};

function stripSocialSectionLabel(line: string) {
  return String(line || "")
    .replace(/^\s*(hook|accroche|titre)\s*[:\-–]\s*/i, "")
    .replace(/^\s*(body|corps|l[ée]gende|contenu)\s*[:\-–]\s*/i, "")
    .replace(/^\s*(cta|appel à l'action|appel a l'action)\s*[:\-–]\s*/i, "")
    .trim();
}

function parseSocialCopilotBlocks(value: string): SocialCopilotBlock[] {
  const text = String(value || "").replace(/\r/g, "").trim();
  if (!text) return [];

  const hookMatch = text.match(/(?:^|\n)\s*(?:HOOK|ACCROCHE|TITRE)\s*[:\-–]\s*([\s\S]*?)(?=\n\s*(?:BODY|CORPS|L[ÉE]GENDE|CONTENU|CTA|APPEL À L'ACTION|APPEL A L'ACTION)\s*[:\-–]|$)/i);
  const bodyMatch = text.match(/(?:^|\n)\s*(?:BODY|CORPS|L[ÉE]GENDE|CONTENU)\s*[:\-–]\s*([\s\S]*?)(?=\n\s*(?:CTA|APPEL À L'ACTION|APPEL A L'ACTION)\s*[:\-–]|$)/i);
  const ctaMatch = text.match(/(?:^|\n)\s*(?:CTA|APPEL À L'ACTION|APPEL A L'ACTION)\s*[:\-–]\s*([\s\S]*?)$/i);

  const blocks: SocialCopilotBlock[] = [];
  const clean = (raw: string) =>
    raw
      .split("\n")
      .map((line) => stripSocialSectionLabel(line))
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

  if (hookMatch?.[1]) blocks.push({ role: "hook", text: clean(hookMatch[1]) });
  if (bodyMatch?.[1]) blocks.push({ role: "body", text: clean(bodyMatch[1]) });
  if (ctaMatch?.[1]) blocks.push({ role: "cta", text: clean(ctaMatch[1]) });

  if (blocks.length >= 2) return blocks.filter((block) => block.text.length > 0);

  const paragraphs = text
    .split(/\n{2,}/)
    .map((part) => clean(part))
    .filter(Boolean);

  if (paragraphs.length >= 3) {
    return [
      { role: "hook", text: paragraphs[0] },
      { role: "body", text: paragraphs.slice(1, -1).join("\n\n") },
      { role: "cta", text: paragraphs[paragraphs.length - 1] },
    ].filter((block) => block.text.length > 0) as SocialCopilotBlock[];
  }

  return [{ role: "body", text: clean(text) }];
}

export default function PostEditor({
  mobileToolsOpen,
  onCloseMobileTools,
  onDirtyChange,
  onSnapshot,
  brief,
}: Props) {
  const [draftLayers, setDraftLayers] = useState<LayerData[] | undefined>(undefined);
  const [draftUI, setDraftUI] = useState<any>(undefined);

  // ✅ Toggle Copilot (persist)
  const [copilotOpen, setCopilotOpen] = useState<boolean>(true);
  useEffect(() => {
    try {
      const v = typeof window !== "undefined" ? window.localStorage.getItem(LS_COPILOT_OPEN) : null;
      if (v === "0") setCopilotOpen(false);
      if (v === "1") setCopilotOpen(true);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") window.localStorage.setItem(LS_COPILOT_OPEN, copilotOpen ? "1" : "0");
    } catch {
      // ignore
    }
  }, [copilotOpen]);

  // refs to avoid loops & stale values
  const layersRef = useRef<LayerData[] | undefined>(undefined);
  const uiRef = useRef<any>(undefined);
  const dirtyRef = useRef(false);

  const lastUiSigRef = useRef<string>("");
  const lastLayersSigRef = useRef<string>("");

  const markDirty = useCallback(() => {
    if (dirtyRef.current) return;
    dirtyRef.current = true;
    onDirtyChange?.(true);
  }, [onDirtyChange]);

  // ✅ restore draft local (si existe)
  useEffect(() => {
    const parsed = safeJsonParse(localStorage.getItem(LS_POST));
    if (!parsed) return;

    if (parsed?.layers && Array.isArray(parsed.layers)) {
      setDraftLayers(parsed.layers);
      layersRef.current = parsed.layers;
      lastLayersSigRef.current = JSON.stringify(parsed.layers);
    }
    if (parsed?.ui) {
      setDraftUI(parsed.ui);
      uiRef.current = parsed.ui;
      lastUiSigRef.current = JSON.stringify(parsed.ui);
    }
  }, []);

  // ✅ persist local (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(
          LS_POST,
          JSON.stringify({
            ui: uiRef.current ?? draftUI,
            layers: layersRef.current ?? draftLayers ?? [],
          })
        );
      } catch {
        // no-op
      }
    }, 250);

    return () => clearTimeout(t);
  }, [draftUI, draftLayers]);

  const initialLayersKey = useMemo(() => "post", []);

  const handleUIChange = useCallback(
    (ui: any) => {
      const cleaned = stripNonSerializableUI(ui ?? {});
      const sig = stableSig(cleaned ?? {});

      if (sig === lastUiSigRef.current) return;

      lastUiSigRef.current = sig;
      uiRef.current = cleaned;

      setDraftUI((prev: any) => (stableSig(prev ?? {}) === sig ? prev : cleaned));
      markDirty();

      onSnapshot?.({
        ui: cleaned,
        layers: layersRef.current ?? [],
      });
    },
    [markDirty, onSnapshot]
  );

  const handleLayersChange = useCallback(
    (layers: LayerData[]) => {
      const sig = stableSig(layers ?? []);
      if (sig === lastLayersSigRef.current) return;

      lastLayersSigRef.current = sig;
      layersRef.current = layers;

      setDraftLayers((prev) => (stableSig(prev ?? []) === sig ? prev : layers));
      markDirty();

      onSnapshot?.({
        ui: uiRef.current,
        layers,
      });
    },
    [markDirty, onSnapshot]
  );

  /** =========================
   *  IA Copilot UI state
   *  ========================= */
  const textLayers = useMemo(() => {
    return (draftLayers ?? []).filter((l: any) => l?.type === "text");
  }, [draftLayers]);


  useEffect(() => {
    const families = Array.from(new Set((draftLayers ?? [])
      .filter((layer: any) => layer?.type === "text")
      .map((layer: any) => String(layer?.style?.fontFamily ?? layer?.fontFamily ?? "").trim())
      .filter(Boolean)));

    families.forEach((family) => ensureFontStylesheetLoaded(family));
  }, [draftLayers]);

  const defaultTargetId = useMemo(() => {
    const anyText = textLayers as any[];
    const byMain = anyText.find((l) => String(l?.id || "").includes("text-main"));
    return (byMain?.id ?? anyText[0]?.id ?? "") as string;
  }, [textLayers]);

  const [targetLayerId, setTargetLayerId] = useState<string>("");
  useEffect(() => {
    if (!targetLayerId && defaultTargetId) setTargetLayerId(defaultTargetId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultTargetId]);

  const [idea, setIdea] = useState<string>("");
  const [network, setNetwork] = useState<Network>("Instagram");
  const [objective, setObjective] = useState<Objective>("Convertir");
  const [angle, setAngle] = useState<Angle>("MRR débutant");
  const [tone, setTone] = useState<string>("coach direct, clair, concret, orienté résultats");
  const [maxChars, setMaxChars] = useState<number>(0);
  const [promptLibraryOpen, setPromptLibraryOpen] = useState<boolean>(false);
  const [lastCopilotTask, setLastCopilotTask] = useState<"hooks" | "caption" | "cta" | "hashtags" | "ab" | "rewrite" | null>(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [aiOutput, setAiOutput] = useState<string>("");
  const [aiHooks, setAiHooks] = useState<string[]>([]);
  const { schedule, loading: scheduleLoading } = useSchedulePlanner();
  const [scheduleOpen, setScheduleOpen] = useState(false);

  // ✅ Coach injection guards (non-destructif)
  const userTouchedIdeaRef = useRef(false);
  const userTouchedObjectiveRef = useRef(false);
  const userTouchedAngleRef = useRef(false);
  const lastInjectedBriefSigRef = useRef<string>("");

  // ✅ Brief banner (and injection) — once per session unless user edits
  const [briefDismissed, setBriefDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(LS_BRIEF_DISMISSED) === "1";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(LS_BRIEF_DISMISSED, briefDismissed ? "1" : "0");
    } catch {
      // ignore
    }
  }, [briefDismissed]);

  const targetLayer = useMemo(() => {
    return (draftLayers ?? []).find((l: any) => String(l?.id) === String(targetLayerId)) as any;
  }, [draftLayers, targetLayerId]);

  // ✅ IMPORTANT: synchroniser la sélection du layer dans l'UI de l'éditeur
  // pour que les propriétés (dont la couleur) s'appliquent bien au layer cible.
  const syncEditorSelection = useCallback(
    (id: string) => {
      if (!id) return;
      const currentUI = uiRef.current ?? {};

      const currentSelectedLayerId = String(currentUI?.selectedLayerId ?? "");
      const currentSelectedId = String(currentUI?.selectedId ?? "");
      const currentSelectionId = String(currentUI?.selection?.id ?? "");
      const currentSelectedLayerIds = Array.isArray(currentUI?.selectedLayerIds)
        ? currentUI.selectedLayerIds.map((x: any) => String(x))
        : [];
      const currentSelectedIds = Array.isArray(currentUI?.selectedIds)
        ? currentUI.selectedIds.map((x: any) => String(x))
        : [];

      const alreadySelected =
        currentSelectedLayerId === String(id) &&
        currentSelectedId === String(id) &&
        currentSelectionId === String(id) &&
        currentSelectedLayerIds.length === 1 &&
        currentSelectedLayerIds[0] === String(id) &&
        currentSelectedIds.length === 1 &&
        currentSelectedIds[0] === String(id);

      if (alreadySelected) return;

      const nextUI = {
        ...currentUI,
        // clés courantes possibles (selon versions)
        selectedLayerId: id,
        selectedId: id,
        selectedLayerIds: [id],
        selectedIds: [id],
        selection: {
          ...(currentUI?.selection || {}),
          id,
          ids: [id],
        },
      };
      handleUIChange(nextUI);
    },
    [handleUIChange]
  );

  useEffect(() => {
    if (targetLayerId) syncEditorSelection(targetLayerId);
  }, [targetLayerId, syncEditorSelection]);

  const applyToLayer = useCallback(
    (text: string) => {
      if (!text || !draftLayers || draftLayers.length === 0) return;
      const id = targetLayerId || defaultTargetId;
      if (!id) return;

      const next = draftLayers.map((l: any) => {
        if (String(l?.id) !== String(id)) return l;
        if (l?.type !== "text") return l;
        return { ...l, text };
      });

      handleLayersChange(next as any);
      // keep selection in sync after apply (so color picker, etc. stays on the right layer)
      syncEditorSelection(id);
    },
    [draftLayers, targetLayerId, defaultTargetId, handleLayersChange, syncEditorSelection]
  );

  const injectCopilotOutputToCanvas = useCallback(
    (value: string) => {
      const blocks = parseSocialCopilotBlocks(value);
      if (!blocks.length) return;

      const canvasW = 1080;
      const canvasH = 1080;
      const blockWidth = Math.round(canvasW * 0.78);
      const x = Math.round((canvasW - blockWidth) / 2);
      const top = Math.round(canvasH * 0.12);
      const gap = 42;
      const now = Date.now();
      let y = top;
      const prev = draftLayers ?? [];
      const baseZ = prev.length + 10;

      const built = blocks.map((block, index) => {
        const isHook = block.role === "hook";
        const isCta = block.role === "cta";
        const fontSize = isHook ? 54 : isCta ? 34 : 28;
        const fontFamily = isHook ? "Montserrat" : "Inter";
        const lineHeight = isHook ? 1.04 : 1.22;
        const height = estimateSocialTextHeight({
          text: block.text,
          width: blockWidth,
          fontSize,
          fontFamily,
          lineHeight,
        });

        const layer = {
          id: `copilot-social-${now}-${index}`,
          type: "text",
          text: block.text,
          x,
          y,
          width: blockWidth,
          height,
          visible: true,
          selected: index === 0,
          zIndex: baseZ + index,
          style: {
            fontSize,
            fontFamily,
            color: isCta ? "#ffcf66" : "#ffffff",
            fontWeight: isHook || isCta ? 800 : 500,
            lineHeight,
          },
        } as any;

        y += height + (isHook || isCta ? gap + 20 : gap);
        return layer;
      });

      handleLayersChange([
        ...prev.map((layer: any) => ({ ...layer, selected: false })),
        ...built,
      ] as any);
      syncEditorSelection(String((built[0] as any)?.id || ""));
    },
    [draftLayers, handleLayersChange, syncEditorSelection]
  );


  function normalizeWhitespace(value: string) {
    return String(value || "")
      .replace(/\r/g, "")
      .replace(/\t+/g, " ")
      .replace(/[ ]{2,}/g, " ")
      .trim();
  }

  function extractHashtagsOnly(value: string) {
    const matches =
      String(value || "").match(/#[A-Za-z0-9À-ÖØ-öø-ÿ_-]+/g) || [];
    const unique: string[] = [];
    for (const tag of matches) {
      if (!unique.includes(tag)) unique.push(tag);
    }
    return unique.slice(0, 20).join(" ");
  }

  function extractShortCaptionOnly(value: string) {
    const cleaned = String(value || "")
      .split(/\r?\n/)
      .map((line) => line.replace(/^\s*[-•*]+\s*/, "").trim())
      .filter((line) => line && !line.startsWith("#") && !/^CTA\s*[:\-]/i.test(line));

    const result: string[] = [];
    for (const line of cleaned) {
      if (/^A\s*[:\-]/i.test(line) || /^B\s*[:\-]/i.test(line)) continue;
      result.push(line);
      if (result.length >= 4) break;
    }

    return normalizeWhitespace(result.join("\n")).slice(0, 280);
  }

  function extractCtasOnly(value: string) {
    const lines = String(value || "")
      .split(/\r?\n/)
      .map((line) => line.replace(/^\s*[-•*]+\s*/, "").trim())
      .filter(Boolean)
      .filter((line) => !line.startsWith("#"));

    const kept: string[] = [];
    for (const line of lines) {
      if (/^A\s*[:\-]/i.test(line) || /^B\s*[:\-]/i.test(line)) continue;
      kept.push(line);
      if (kept.length >= 5) break;
    }

    return kept.join("\n");
  }

  function normalizeCopilotOutput(task: "hooks" | "caption" | "cta" | "hashtags" | "ab" | "rewrite", value: string) {
    if (task === "hashtags") return extractHashtagsOnly(value);
    if (task === "cta") return extractCtasOnly(value);
    if (task === "caption") return String(value || "").replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
    return normalizeWhitespace(String(value || ""));
  }

  function buildContext() {
    const base = [
      "Tu es LGD Copilot Social : copywriter senior spécialisé posts réseaux sociaux, produits digitaux, IA, MRR, affiliation et marketing digital.",
      "Tu écris pour capter l'attention, créer de la confiance et donner envie d'agir sans jamais faire de promesse magique.",
      "Tu évites le blabla, les phrases génériques et le ton motivationnel vide : chaque phrase doit servir le hook, la tension, la clarté ou le CTA.",
      "Tu produis du contenu prêt à publier, naturel, premium, humain, orienté engagement et conversion douce.",
      `Réseau: ${network}. Objectif: ${objective}. Angle: ${angle}.`,
    ].join("\n");
    const b = (brief || "").trim();
    if (!b) return base;
    return [base, "---", "Brief du coach (à respecter):", b].join("\n");
  }


  const applySocialPromptTemplate = useCallback((template: SocialPromptTemplate) => {
    userTouchedIdeaRef.current = true;
    userTouchedObjectiveRef.current = true;
    userTouchedAngleRef.current = true;
    setIdea(template.idea);
    setNetwork(template.network);
    setObjective(template.objective);
    setAngle(template.angle);
    setTone(template.tone);
    setMaxChars(template.maxChars);
    setPromptLibraryOpen(false);
  }, []);

  async function runCopilot(task: "hooks" | "caption" | "cta" | "hashtags" | "ab" | "rewrite") {
    setAiError(null);
    setAiLoading(true);

    try {
      const currentText = String((targetLayer as any)?.text ?? "").trim();
      const topic = (idea || "").trim() || currentText || "marketing digital / produits digitaux / MRR";

      const ctx = buildContext();
      let prompt = "";

      if (task === "hooks") {
        prompt = [
          ctx,
          "Génère 10 hooks ULTRA accrocheurs, courts, dédiés au marketing digital et MRR.",
          "Format STRICT : une liste numérotée 1 à 10, une seule ligne par hook. Pas d'explication.",
          `Sujet: ${topic}`,
        ].join("\n");
      } else if (task === "caption") {
        prompt = [
          ctx,
          "Génère UN post social premium prêt à injecter dans un canvas.",
          "Structure obligatoire : HOOK, BODY, CTA.",
          "HOOK : 1 à 3 phrases fortes, très lisibles, qui arrêtent le scroll.",
          "BODY : 2 à 4 courts paragraphes qui clarifient l'idée, créent confiance et donnent envie d'agir.",
          "CTA : 1 phrase finale claire, orientée commentaire, DM, sauvegarde ou action douce.",
          "Ne mets aucun hashtag. Ne donne aucune explication. Ne fais pas de liste technique.",
          "Format STRICT :",
          "HOOK: <texte>",
          "BODY: <texte>",
          "CTA: <texte>",
          `Sujet: ${topic}`,
        ].join("\n");
      } else if (task === "cta") {
        prompt = [
          ctx,
          "Génère 5 CTA courts orientés conversion MRR (DM mot-clé / commentaire mot-clé / lien en bio).",
          "Format STRICT : 5 lignes maximum, 1 CTA par ligne, aucun paragraphe, aucune explication, aucun hashtag.",
          `Sujet: ${topic}`,
        ].join("\n");
      } else if (task === "hashtags") {
        prompt = [
          ctx,
          "Génère 20 hashtags pertinents pour le sujet, en français + quelques EN si utile.",
          "Format STRICT : une seule ligne composée uniquement de hashtags séparés par des espaces.",
          "Aucun mot hors hashtag. Aucune phrase. Aucune explication.",
          `Sujet: ${topic}`,
        ].join("\n");
      } else if (task === "ab") {
        prompt = [
          ctx,
          "Crée 2 versions (A et B) d'une caption prête à poster.",
          "A = style très direct / conversion. B = storytelling crédible.",
          "Format STRICT :",
          "A: <texte>",
          "B: <texte>",
          `Sujet: ${topic}`,
        ].join("\n");
      } else {
        // rewrite
        prompt = [
          ctx,
          "Réécris et améliore ce texte pour le rendre plus clair, plus persuasif et orienté MRR.",
          "Ne renvoie QUE le texte final.",
          `TEXTE:\n${currentText || topic}`,
        ].join("\n");
      }

      const out = await aiRewriteText({
        text: prompt,
        tone: tone?.trim() ? tone.trim() : undefined,
        max_length: maxChars > 0 ? maxChars : undefined,
      });

      // Parse hooks if needed
      if (task === "hooks") {
        const lines = out
          .split(/\r?\n/)
          .map((l) => l.replace(/^\s*\d+[\.)-]\s*/, "").trim())
          .filter(Boolean);

        setAiHooks(lines.slice(0, 10));
        setAiOutput(out);
        setLastCopilotTask(task);
      } else {
        setAiHooks([]);
        setAiOutput(normalizeCopilotOutput(task, out));
        setLastCopilotTask(task);
      }
    } catch (e: any) {
      setAiError(e?.message || "Erreur IA");
    } finally {
      setAiLoading(false);
    }
  }

  const copilotDisabled = !apiBase();

  // ✅ Coach brief → Copilot injection (subject + objective + angle + auto-first-caption)
  useEffect(() => {
    const b = (brief || "").trim();
    if (!b) return;

    const sig = normalizeBriefSig(b);

    // 1) Pré-remplir le sujet / idée (non-destructif)
    if (!userTouchedIdeaRef.current) {
      setIdea((prev) => (prev && prev.trim().length > 0 ? prev : b));
    }

    // 2) Objectif & Angle auto (non-destructif)
    if (!userTouchedObjectiveRef.current) {
      const inferredObj = inferObjectiveFromBrief(b);
      setObjective((prev) => (userTouchedObjectiveRef.current ? prev : inferredObj));
    }

    if (!userTouchedAngleRef.current) {
      const inferredAngle = inferAngleFromBrief(b);
      setAngle((prev) => (userTouchedAngleRef.current ? prev : inferredAngle));
    }

    // 3) Auto-génération (caption) une seule fois par brief (si API dispo)
    if (copilotDisabled) return;
    if (aiLoading) return;

    // anti-loop: une seule fois par brief
    if (lastInjectedBriefSigRef.current === sig) return;

    // si l'utilisateur a déjà un output, ne force pas (évite de surprendre)
    if (aiOutput && aiOutput.trim().length > 0) {
      lastInjectedBriefSigRef.current = sig;
      return;
    }

    lastInjectedBriefSigRef.current = sig;

    // run async, sans modifier la logique IA existante
    // (le brief est déjà injecté dans le contexte via buildContext())
    setTimeout(() => {
      runCopilot("caption").catch(() => {
        // runCopilot gère déjà l'erreur
      });
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brief]);

  const plannerTitle = useMemo(() => {
    const firstText = textLayers
      .map((layer: any) => String(layer?.text || "").trim())
      .find(Boolean);
    return clip(firstText || idea || brief || "Post intelligent LGD", 72);
  }, [textLayers, idea, brief]);

  const handleScheduleConfirm = useCallback(
    async ({ reseau, date_programmee, titre }: { reseau: string; date_programmee: string; titre?: string }) => {
      const safeLayers = Array.isArray(draftLayers) ? draftLayers : [];
      let previewImage = "";

      if (safeLayers.length) {
        try {
          previewImage = await renderEditorCreationToDataUrl({
            mode: "post",
            draft: {
              ui: draftUI,
              layers: safeLayers,
            },
          });
        } catch (error) {
          console.error("LGD planner snapshot error (post):", error);
        }
      }

      await schedule({
        reseau,
        date_programmee,
        titre: titre || plannerTitle,
        format: "post",
        contenu: {
          title: titre || plannerTitle,
          type: "post",
          layers: safeLayers,
          ui: draftUI,
          brief: brief || "",
          preview_image: previewImage || undefined,
          planner_preview_image: previewImage || undefined,
        },
      });
      setScheduleOpen(false);
      if (typeof window !== "undefined") window.alert("✅ Ajouté au Planner !");
    },
    [schedule, plannerTitle, draftLayers, draftUI, brief]
  );

  return (
    <div className="w-full flex justify-center pt-[110px] pb-20">
      {/* ================= CANVAS XL WRAPPER ================= */}
      <div className="w-full max-w-[1600px] px-6">
        <div
          className="rounded-3xl p-8"
          style={{
            backgroundColor: "#262626",
            border: "1px solid rgba(255,184,0,0.25)",
          }}
        >
          {/* ================= COACH BRIEF (injected) ================= */}
          {!briefDismissed && (brief || "").trim() ? (
            <div className="mb-6 rounded-3xl border border-yellow-500/20 bg-yellow-500/10 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-yellow-200 font-semibold">Brief reçu du Coach Alex V2</div>
                  <div className="mt-1 text-sm text-yellow-100/80 whitespace-pre-wrap">{(brief || "").trim()}</div>
                  <div className="mt-2 text-[11px] text-white/55">
                    ✅ Injecté automatiquement dans le Copilot (Sujet + Objectif + Angle + 1ère génération).
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setBriefDismissed(true)}
                  className="shrink-0 rounded-xl border border-yellow-500/25 bg-black/30 px-3 py-2 text-xs font-semibold text-yellow-200 hover:bg-black/45"
                >
                  Ignorer
                </button>
              </div>
            </div>
          ) : null}

          {/* ================= IA COPILOT (POST 1:1) ================= */}
          <div
            className="mb-6 rounded-3xl p-5"
            style={{
              background: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,184,0,0.18)",
            }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div>
                <div className="text-yellow-200 font-semibold text-lg">Copilot IA — Post 1:1 (Marketing digital • MRR)</div>
                <div className="text-white/60 text-sm">
                  Génère hooks, légende courte, CTA, hashtags et variantes orientés produits digitaux & Master Resell Rights. (texte-only, safe)
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setCopilotOpen((v) => !v)}
                  className="rounded-xl px-3 py-2 text-sm font-semibold border border-yellow-500/25 bg-black/30 text-yellow-200 hover:bg-black/45"
                >
                  {copilotOpen ? "▾ Masquer l’IA" : "▸ Afficher l’IA"}
                </button>


                <button
                  type="button"
                  onClick={() => setPromptLibraryOpen((v) => !v)}
                  className="rounded-xl px-3 py-2 text-sm font-semibold border border-yellow-500/25 bg-yellow-500/10 text-yellow-200 hover:bg-yellow-500/15"
                >
                  ✨ Performeur Réseaux™
                </button>

                <button
                  onClick={() => runCopilot("hooks")}
                  disabled={aiLoading || copilotDisabled}
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-black bg-[#ffb800] hover:brightness-110 disabled:opacity-60"
                >
                  Hooks x10
                </button>
                <button
                  onClick={() => runCopilot("caption")}
                  disabled={aiLoading || copilotDisabled}
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-black bg-[#ffb800] hover:brightness-110 disabled:opacity-60"
                >
                  Légende IA
                </button>
                <button
                  onClick={() => runCopilot("cta")}
                  disabled={aiLoading || copilotDisabled}
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-black bg-[#ffb800] hover:brightness-110 disabled:opacity-60"
                >
                  CTA
                </button>
                <button
                  onClick={() => runCopilot("hashtags")}
                  disabled={aiLoading || copilotDisabled}
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-black bg-[#ffb800] hover:brightness-110 disabled:opacity-60"
                >
                  Hashtags
                </button>
                <button
                  onClick={() => runCopilot("ab")}
                  disabled={aiLoading || copilotDisabled}
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-black bg-[#ffb800] hover:brightness-110 disabled:opacity-60"
                >
                  Variantes A/B
                </button>
              </div>
            </div>

            {copilotOpen && (
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">

                {promptLibraryOpen ? (
                  <div className="lg:col-span-12 rounded-3xl border border-yellow-500/20 bg-black/35 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-300">✨ Performeur Réseaux™</div>
                        <div className="mt-1 text-sm text-white/60">Scénarios marketing experts pour créer des contenus qui captent l’attention, engagent et convertissent.</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPromptLibraryOpen(false)}
                        className="rounded-xl border border-yellow-500/20 bg-black/30 px-3 py-2 text-xs font-semibold text-yellow-100 hover:bg-black/50"
                      >
                        Fermer
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {SOCIAL_PROMPT_LIBRARY.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => applySocialPromptTemplate(item)}
                          className="group rounded-2xl border border-yellow-500/15 bg-black/45 p-4 text-left transition hover:border-yellow-400/45 hover:bg-yellow-500/10"
                        >
                          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-yellow-300">{item.category}</div>
                          <div className="mt-2 text-base font-extrabold text-white group-hover:text-yellow-100">{item.title}</div>
                          <div className="mt-2 text-sm leading-6 text-white/60">{item.description}</div>
                          <div className="mt-4 inline-flex rounded-xl bg-[#ffb800] px-3 py-2 text-xs font-bold text-black">Utiliser ce prompt</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="lg:col-span-4">
                  <label className="block text-yellow-300 text-xs mb-2">Sujet / idée (optionnel)</label>
                  <input
                    value={idea}
                    onChange={(e) => {
                      userTouchedIdeaRef.current = true;
                      setIdea(e.target.value);
                    }}
                    placeholder="Ex : vendre une formation MRR sans audience…"
                    className="w-full rounded-2xl bg-black/40 border border-yellow-500/20 px-4 py-3 text-yellow-100 outline-none"
                  />

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-yellow-300 text-xs mb-2">Réseau</label>
                      <select
                        value={network}
                        onChange={(e) => setNetwork(e.target.value as Network)}
                        className="w-full rounded-2xl bg-black/40 border border-yellow-500/20 px-4 py-3 text-yellow-100 outline-none"
                      >
                        <option>Instagram</option>
                        <option>TikTok</option>
                        <option>LinkedIn</option>
                        <option>Facebook</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-yellow-300 text-xs mb-2">Objectif</label>
                      <select
                        value={objective}
                        onChange={(e) => {
                          userTouchedObjectiveRef.current = true;
                          setObjective(e.target.value as Objective);
                        }}
                        className="w-full rounded-2xl bg-black/40 border border-yellow-500/20 px-4 py-3 text-yellow-100 outline-none"
                      >
                        <option>Attirer</option>
                        <option>Éduquer</option>
                        <option>Convertir</option>
                        <option>Story</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-yellow-300 text-xs mb-2">Angle</label>
                    <select
                      value={angle}
                      onChange={(e) => {
                        userTouchedAngleRef.current = true;
                        setAngle(e.target.value as Angle);
                      }}
                      className="w-full rounded-2xl bg-black/40 border border-yellow-500/20 px-4 py-3 text-yellow-100 outline-none"
                    >
                      <option>MRR débutant</option>
                      <option>Produit digital</option>
                      <option>Objection</option>
                      <option>Storytelling</option>
                      <option>Preuve</option>
                      <option>Tutoriel</option>
                      <option>Erreur fréquente</option>
                      <option>Mindset / discipline</option>
                    </select>
                  </div>

                  <div className="mt-3">
                    <label className="block text-yellow-300 text-xs mb-2">Ton / Style (LGD)</label>
                    <input
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full rounded-2xl bg-black/40 border border-yellow-500/20 px-4 py-3 text-yellow-100 outline-none"
                    />
                  </div>

                  <div className="mt-3">
                    <label className="block text-yellow-300 text-xs mb-2">Appliquer sur le layer texte</label>
                    <select
                      value={targetLayerId}
                      onChange={(e) => setTargetLayerId(e.target.value)}
                      className="w-full rounded-2xl bg-black/40 border border-yellow-500/20 px-4 py-3 text-yellow-100 outline-none"
                    >
                      {textLayers.length === 0 ? <option value="">Aucun layer texte</option> : null}
                      {textLayers.map((l: any) => (
                        <option key={String(l.id)} value={String(l.id)}>
                          {String(l.id)} — “{clip(String(l.text || ""))}”
                        </option>
                      ))}
                    </select>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => syncEditorSelection(targetLayerId || defaultTargetId)}
                        disabled={!targetLayerId && !defaultTargetId}
                        className="rounded-xl px-3 py-2 text-xs text-yellow-100 border border-yellow-500/20 bg-black/40 hover:bg-black/60 disabled:opacity-60"
                      >
                        Sélectionner ce layer dans l’éditeur
                      </button>
                      <div className="text-[11px] text-white/45">
                        Pour changer la <span className="text-yellow-200">couleur</span>, clique ce bouton puis utilise le panneau Propriétés.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-8">
                  <div className="rounded-3xl p-4 bg-black/30 border border-yellow-500/15">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-yellow-200 font-semibold">Résultat IA</div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => injectCopilotOutputToCanvas(aiOutput)}
                          disabled={aiLoading || !aiOutput || lastCopilotTask === "hashtags"}
                          className="rounded-xl px-3 py-2 text-sm font-semibold text-black bg-[#ffb800] hover:brightness-110 disabled:opacity-60"
                        >
                          Injecter dans le canvas
                        </button>
                        <button
                          onClick={() => applyToLayer(aiOutput)}
                          disabled={aiLoading || !aiOutput || textLayers.length === 0}
                          className="rounded-xl px-3 py-2 text-sm font-semibold text-yellow-100 border border-yellow-500/25 bg-black/40 hover:bg-black/55 disabled:opacity-60"
                        >
                          Appliquer au layer
                        </button>
                        <button
                          onClick={() => {
                            setAiOutput("");
                            setAiHooks([]);
                            setAiError(null);
                          }}
                          className="rounded-xl px-3 py-2 text-sm text-yellow-100 border border-yellow-500/20 bg-black/40 hover:bg-black/60"
                        >
                          Effacer
                        </button>
                      </div>
                    </div>

                    {copilotDisabled ? (
                      <div className="mt-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-red-200 text-sm">
                        NEXT_PUBLIC_API_URL manquant côté frontend.
                      </div>
                    ) : null}

                    {aiError ? (
                      <div className="mt-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-red-200 text-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>{aiError}</div>
                          {isQuotaError(aiError) ? (
                            <button
                              type="button"
                              onClick={openPlans}
                              className="shrink-0 rounded-xl border border-yellow-500/25 bg-black/35 px-3 py-2 text-xs font-semibold text-yellow-200 hover:bg-black/50"
                            >
                              Voir les plans
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ) : null}

                    {aiLoading ? (
                      <div className="mt-3 rounded-2xl border border-yellow-500/15 bg-black/25 px-4 py-8">
                        <div className="flex flex-col items-center justify-center gap-4">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
                          <div className="text-sm text-white/70">Génération IA en cours...</div>
                          <div className="text-xs text-white/45 text-center">
                            LGD prépare une proposition premium à injecter dans ton post.
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {!aiLoading && aiHooks.length > 0 ? (
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {aiHooks.map((h, idx) => (
                          <button
                            key={`${idx}-${h}`}
                            onClick={() => {
                              setAiOutput(h);
                              applyToLayer(h);
                            }}
                            className="text-left rounded-2xl border border-yellow-500/15 bg-black/40 hover:bg-black/55 px-4 py-3 text-yellow-100"
                          >
                            <div className="text-[11px] text-white/45 mb-1">Hook {idx + 1}</div>
                            <div className="text-sm font-semibold">{h}</div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        value={aiOutput}
                        onChange={(e) => setAiOutput(e.target.value)}
                        placeholder="Les résultats IA apparaîtront ici…"
                        rows={10}
                        className="mt-3 w-full rounded-2xl bg-black/40 border border-yellow-500/15 px-4 py-3 text-yellow-100 outline-none"
                      />
                    )}

                    <div className="mt-3 text-[11px] text-white/45">
                      Note : l’IA est volontairement spécialisée “marketing digital / produits digitaux / MRR”. Si tu sors du scope, elle recadre.
                    </div>
                  </div>

                  {targetLayer ? (
                    <div className="mt-3 text-[11px] text-white/45">
                      Layer cible actuel : <span className="text-yellow-200">{String((targetLayer as any)?.id || "")}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          {/* ================= EDITOR ================= */}

          <div className="w-full min-h-[820px] flex justify-center">
            <EditorLayout
              initialLayersKey={initialLayersKey}
              initialLayers={draftLayers}
              initialUI={draftUI}
              onUIChange={handleUIChange}
              onChange={handleLayersChange}
              mobileToolsOpen={mobileToolsOpen}
              onCloseMobileTools={onCloseMobileTools}
            />
          </div>

          <SchedulePlannerModal
            open={scheduleOpen}
            loading={scheduleLoading}
            defaultTitle={plannerTitle}
            onClose={() => setScheduleOpen(false)}
            onConfirm={handleScheduleConfirm}
          />
        </div>
      </div>
    </div>
  );
}
