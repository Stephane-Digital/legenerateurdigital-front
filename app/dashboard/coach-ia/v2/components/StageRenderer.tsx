"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getBehaviorTags,
  makeOptimizationRecFromBlocker,
} from "../lib/alexBehaviorEngine";
import {
  canRegenPlan,
  commitPlanRegen,
  getCoachPlanLimits,
  getUpgradeHintForPlanRegen,
  tierFromPlanLabel,
  type PlanTier,
} from "../lib/planPolicy";
import type {
  AlexAudienceSize,
  AlexBusinessGoal,
  AlexBusinessModel,
  AlexContext,
  AlexIntent,
  AlexLevel,
  AlexMainBlocker,
  AlexRoadmap,
  AlexStage,
  AlexToday,
  DailyLog,
  TimePerDay,
} from "../lib/types";

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#2a2416] bg-black/20 px-3 py-1 text-xs text-white/60">
      {children}
    </span>
  );
}

type FormActionParcours =
  | "creation_produit_digital"
  | "affiliation"
  | "code_liberte"
  | "non_defini";

type FormActionBusinessProject = {
  offerDescription?: string;
  problemSolved?: string;
  transformationPromise?: string;
  targetAudienceDescription?: string;
  personaName?: string;
  positioning?: string;
  businessModel?: AlexBusinessModel;
  parcours?: FormActionParcours;
  recommendedPlatform?: string;
  platformReason?: string;
  estimatedTimeBeforeSale?: string;
  firstRevenueGoal?: string;
  nextMission?: string;
  missionFollowing?: string;
  contentAngle?: string;
  salesAngle?: string;
  offerReadinessScore?: number;
  updatedAtISO?: string;
};

function normalizeText(value: unknown) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function labelBusinessModel(model: AlexBusinessModel) {
  if (model === "affiliation") return "Affiliation";
  if (model === "offre_digitale") return "Création de produit digital";
  if (model === "coaching") return "Coaching / accompagnement";
  if (model === "contenu") return "Contenu + audience";
  return "Modèle à confirmer";
}

function labelBusinessGoal(goal: AlexBusinessGoal) {
  if (goal === "revenu_500") return "500€/mois";
  if (goal === "premiers_clients") return "premiers clients";
  if (goal === "quitter_job") return "sortie progressive du salariat";
  if (goal === "business_stable") return "business stable";
  return "premiers revenus";
}

function labelLevel(level: AlexLevel) {
  if (level === "sans_resultat") return "a déjà essayé sans résultat";
  if (level === "quelques_ventes") return "a déjà généré quelques ventes";
  return "débute aujourd’hui";
}

function labelAudienceSize(size: AlexAudienceSize) {
  if (size === "zero") return "part de zéro";
  if (size === "500_5000") return "dispose déjà d’une petite audience";
  if (size === "plus_5000") return "dispose déjà d’une audience exploitable";
  return "a une audience encore limitée";
}

function labelBlocker(blocker: AlexMainBlocker) {
  if (blocker === "temps") return "manque de temps";
  if (blocker === "technique") return "bloque sur la technique";
  if (blocker === "vente") return "ne sait pas vendre simplement";
  if (blocker === "confiance") return "manque de confiance";
  return "se disperse trop";
}

function inferProblemSolved(
  offerDescription: string,
  businessModel: AlexBusinessModel,
) {
  const offer = normalizeText(offerDescription);
  const lower = offer.toLowerCase();

  if (lower.includes("mrr") || lower.includes("revente")) {
    return "Aider des personnes motivées à arrêter d’acheter des formations sans résultat et à transformer une offre digitale existante en vraie première vente.";
  }

  if (lower.includes("salariat") || lower.includes("liberté") || lower.includes("liberte")) {
    return "Aider des salariés ou personnes en transition à construire progressivement une activité digitale sans tout quitter du jour au lendemain.";
  }

  if (businessModel === "affiliation") {
    return "Aider une audience ciblée à choisir la bonne solution, à passer à l’action et à éviter de rester bloquée dans la consommation d’informations.";
  }

  if (businessModel === "offre_digitale") {
    return "Transformer une compétence, une méthode ou une expérience en solution simple, compréhensible et vendable.";
  }

  if (businessModel === "coaching") {
    return "Accompagner une personne d’un point A confus vers un point B concret, mesurable et rassurant.";
  }

  return "Clarifier un problème précis, rendre la solution simple à comprendre et donner envie de passer à l’action.";
}

function inferTransformationPromise(args: {
  offerDescription: string;
  problemSolved: string;
  businessGoal: AlexBusinessGoal;
  businessModel: AlexBusinessModel;
}) {
  const goal = labelBusinessGoal(args.businessGoal);
  const model = labelBusinessModel(args.businessModel).toLowerCase();

  if (args.businessModel === "affiliation") {
    return `Passer d’une audience tiède qui hésite à une stratégie d’affiliation claire capable de générer ${goal}, avec une offre comprise, un message simple et une action quotidienne orientée vente.`;
  }

  if (args.businessModel === "offre_digitale") {
    return `Passer d’une idée encore floue à un produit digital structuré, positionné et prêt à être présenté à une audience ciblée pour viser ${goal}.`;
  }

  return `Passer d’un projet ${model} dispersé à un chemin d’action clair, mesurable et orienté ${goal}.`;
}

function buildPremiumAvatar(args: {
  offerDescription: string;
  businessModel: AlexBusinessModel;
  businessGoal: AlexBusinessGoal;
  level: AlexLevel;
  audienceSize: AlexAudienceSize;
  mainBlocker: AlexMainBlocker;
  problemSolved: string;
}) {
  const offer = normalizeText(args.offerDescription);
  if (!offer) return "";

  const lower = offer.toLowerCase();
  const isMrr = lower.includes("mrr") || lower.includes("revente");
  const isAffiliation = args.businessModel === "affiliation" || lower.includes("affiliation");
  const isSalary = lower.includes("salariat") || lower.includes("reconversion") || lower.includes("liberté") || lower.includes("liberte");

  const personaName = isMrr || isAffiliation ? "Avatar : Sophie, 42 ans" : isSalary ? "Avatar : Marc, 47 ans" : "Avatar : Client idéal prioritaire";

  const situation = isMrr
    ? "A déjà acheté une ou plusieurs formations MRR, suit beaucoup de contenus business, mais n’arrive pas à transformer ses connaissances en ventes réelles."
    : isAffiliation
      ? "Veut générer ses premiers revenus en ligne sans créer son propre produit, mais ne sait pas quelle offre recommander ni comment en parler sans forcer."
      : isSalary
        ? "Salarié ou personne en transition qui veut créer une activité digitale en parallèle, sans prendre de risque brutal."
        : "Personne motivée qui veut résoudre un problème concret, mais manque d’une méthode claire et d’un plan d’action simple.";

  const frustrations = [
    "Trop d’informations contradictoires.",
    "Difficulté à savoir quoi faire aujourd’hui.",
    "Impression d’avancer sans résultat visible.",
    args.mainBlocker === "technique"
      ? "Blocage dès qu’il faut utiliser des outils ou publier."
      : args.mainBlocker === "vente"
        ? "Peur de vendre, de déranger ou de ne pas être légitime."
        : args.mainBlocker === "temps"
          ? "Peu de temps disponible et peur de perdre ses soirées pour rien."
          : "Tendance à changer de méthode avant d’avoir des résultats.",
  ];

  const fears = [
    "Perdre encore du temps.",
    "Investir dans une solution qui ne mène à rien.",
    "Être jugé par son entourage ou son audience.",
    "Ne pas réussir à expliquer clairement son offre.",
  ];

  const desires = [
    `Atteindre ${labelBusinessGoal(args.businessGoal)} avec une méthode réaliste.`,
    "Être guidé étape par étape.",
    "Savoir quoi publier, quoi dire et quoi vendre.",
    "Voir des actions simples produire des résultats mesurables.",
  ];

  const tried = isMrr
    ? "A déjà testé des formations, des prompts, des tunnels copiés, des posts isolés ou des méthodes vues sur les réseaux."
    : "A déjà consommé du contenu gratuit, commencé plusieurs idées ou essayé d’appliquer des conseils sans structure.";

  const whyBlocked = args.mainBlocker === "vente"
    ? "Il ne manque pas forcément d’envie : il lui manque un message de vente simple, humain et rassurant."
    : args.mainBlocker === "technique"
      ? "Il bloque parce que la technique prend toute la place avant même que l’offre soit claire."
      : args.mainBlocker === "temps"
        ? "Il échoue parce qu’il essaye d’en faire trop au lieu d’avoir une seule action rentable par jour."
        : "Il échoue parce qu’il consomme plus qu’il n’exécute et change trop vite de direction.";

  return `${personaName}

Situation actuelle
${situation}

Problème profond
${args.problemSolved}

Frustrations
- ${frustrations.join("\n- ")}

Peurs
- ${fears.join("\n- ")}

Désirs
- ${desires.join("\n- ")}

Ce qu’il a déjà essayé
${tried}

Pourquoi il échoue aujourd’hui
${whyBlocked}

Ce qu’il attend de toi
Une direction claire, une solution simple, un langage rassurant, un plan d’action concret et la sensation qu’il peut avancer même s’il n’est pas expert.

Comment lui parler
Utilise un ton humain, direct, rassurant, sans jargon. Montre que tu comprends sa fatigue, ses doutes et son besoin d’un chemin simple.

Ce qui le fera acheter
- Une promesse claire et crédible.
- Une preuve que la méthode est applicable rapidement.
- Une réduction de la charge technique.
- Une première étape simple à exécuter aujourd’hui.
- La sensation d’être accompagné plutôt que livré à lui-même.`;
}

function inferTargetAudienceFromOffer(
  offerDescription: string,
  businessModel: AlexBusinessModel,
  businessGoal: AlexBusinessGoal = "premiers_revenus",
  level: AlexLevel = "debutant",
  audienceSize: AlexAudienceSize = "moins_500",
  mainBlocker: AlexMainBlocker = "dispersion",
  problemSolved?: string,
) {
  const offer = normalizeText(offerDescription);
  if (!offer) return "";

  return buildPremiumAvatar({
    offerDescription: offer,
    businessModel,
    businessGoal,
    level,
    audienceSize,
    mainBlocker,
    problemSolved: problemSolved || inferProblemSolved(offer, businessModel),
  });
}

function inferPlatform(args: {
  businessModel: AlexBusinessModel;
  primaryChannel: string;
  audienceSize: AlexAudienceSize;
  mainBlocker: AlexMainBlocker;
}) {
  const raw = normalizeText(args.primaryChannel).toLowerCase();
  const channel = raw.includes("facebook")
    ? "Facebook"
    : raw.includes("pinterest")
      ? "Pinterest"
      : raw.includes("tiktok")
        ? "TikTok"
        : "Instagram";

  if (args.businessModel === "affiliation") {
    return {
      recommendedPlatform: `${channel} d’abord, Facebook ensuite`,
      platformReason:
        "L’affiliation demande d’abord de créer de la confiance, de répéter un angle simple et d’ouvrir des conversations avant de multiplier les canaux.",
    };
  }

  if (args.businessModel === "offre_digitale") {
    return {
      recommendedPlatform: "Instagram + Systeme.io",
      platformReason:
        "Instagram sert à tester le message et Systeme.io sert à transformer l’intérêt en page, capture email et première vente.",
    };
  }

  return {
    recommendedPlatform: channel,
    platformReason:
      "Ce canal permet de concentrer l’énergie au lieu de disperser l’utilisateur sur plusieurs réseaux trop tôt.",
  };
}

function inferFormActionProject(args: {
  offerDescription: string;
  problemSolved: string;
  transformationPromise: string;
  targetAudienceDescription: string;
  businessModel: AlexBusinessModel;
  businessGoal: AlexBusinessGoal;
  level: AlexLevel;
  audienceSize: AlexAudienceSize;
  mainBlocker: AlexMainBlocker;
  primaryChannel: string;
  positioning: string;
  firstRevenueGoal: string;
}): FormActionBusinessProject {
  const offer = normalizeText(args.offerDescription);
  const audience = normalizeText(args.targetAudienceDescription);
  const lower = `${offer} ${audience} ${args.problemSolved}`.toLowerCase();

  const parcours: FormActionParcours =
    args.businessModel === "affiliation" || lower.includes("affiliation")
      ? "affiliation"
      : args.businessModel === "offre_digitale"
        ? "creation_produit_digital"
        : lower.includes("liberté") ||
            lower.includes("liberte") ||
            lower.includes("salariat")
          ? "code_liberte"
          : "non_defini";

  const platform = inferPlatform({
    businessModel: args.businessModel,
    primaryChannel: args.primaryChannel,
    audienceSize: args.audienceSize,
    mainBlocker: args.mainBlocker,
  });

  const estimatedTimeBeforeSale =
    parcours === "creation_produit_digital"
      ? args.level === "quelques_ventes"
        ? "5 à 10 jours"
        : "7 à 14 jours"
      : parcours === "affiliation"
        ? args.audienceSize === "zero"
          ? "7 à 10 jours"
          : "3 à 7 jours"
        : "7 jours";

  const offerReadinessScore = Math.min(
    100,
    Math.max(
      35,
      (offer.length > 120 ? 25 : 10) +
        (audience.length > 300 ? 25 : 10) +
        (args.problemSolved.length > 80 ? 20 : 10) +
        (args.transformationPromise.length > 80 ? 20 : 10) +
        (args.firstRevenueGoal ? 10 : 0),
    ),
  );

  const nextMission =
    parcours === "affiliation"
      ? "Écrire l’angle de recommandation affiliée en 3 phrases : problème, solution, raison de faire confiance."
      : parcours === "creation_produit_digital"
        ? "Transformer l’idée en promesse vendable : résultat concret, cible précise, première étape livrable."
        : "Clarifier le positionnement et choisir une première action de vente simple.";

  const missionFollowing =
    parcours === "affiliation"
      ? "Créer le premier contenu de conversion puis ouvrir 3 conversations qualifiées."
      : parcours === "creation_produit_digital"
        ? "Construire la page simple de prévente puis préparer une séquence email courte."
        : "Tester l’angle sur Instagram avec un post problème → solution.";

  const contentAngle =
    parcours === "affiliation"
      ? "Raconter le blocage vécu par la cible, puis montrer pourquoi cette solution évite de repartir de zéro."
      : "Montrer la transformation promise avec une situation avant/après très concrète.";

  const salesAngle =
    parcours === "affiliation"
      ? "Ne pas vendre la formation : vendre le raccourci, la clarté et le passage à l’action."
      : "Ne pas vendre un produit : vendre le résultat mesurable et le soulagement immédiat.";

  return {
    offerDescription: offer,
    problemSolved: normalizeText(args.problemSolved),
    transformationPromise: normalizeText(args.transformationPromise),
    targetAudienceDescription: audience,
    positioning: args.positioning,
    businessModel: args.businessModel,
    parcours,
    recommendedPlatform: platform.recommendedPlatform,
    platformReason: platform.platformReason,
    estimatedTimeBeforeSale,
    firstRevenueGoal: args.firstRevenueGoal,
    nextMission,
    missionFollowing,
    contentAngle,
    salesAngle,
    offerReadinessScore,
    updatedAtISO: new Date().toISOString(),
  };
}

function parcoursLabel(parcours?: FormActionParcours) {
  if (parcours === "affiliation") return "Affiliation";
  if (parcours === "creation_produit_digital") return "Création produit digital";
  if (parcours === "code_liberte") return "Code Liberté";
  return "À confirmer";
}

export default function StageRenderer(props: {
  stage: AlexStage;
  planLabel?: string;
  context: AlexContext | null;
  roadmap: AlexRoadmap | null;
  today: AlexToday | null;
  logs: DailyLog[];
  onStartOnboarding: () => void;
  businessProject?: FormActionBusinessProject | null;
  onSubmitOnboarding: (data: {
    intent: AlexIntent;
    level: AlexLevel;
    timePerDay: TimePerDay;
    businessGoal: AlexBusinessGoal;
    businessModel: AlexBusinessModel;
    audienceSize: AlexAudienceSize;
    mainBlocker: AlexMainBlocker;
    offerDescription: string;
    targetAudienceDescription: string;
    primaryChannel: string;
    channelNotes: string;
    formActionProject: FormActionBusinessProject;
  }) => void;
  onOpenPlan: () => void;
  onGoMission: () => void;
  onAskCommit: () => void;
  onFeedbackDone: () => void;
  onFeedbackNotYet: () => void;
  onSubmitFeedback: (data: {
    done: boolean;
    kpiValue: number;
    blocker: DailyLog["blocker"];
  }) => void;
  onGenerateNext: () => void;
  onOpenParcours: () => void;
}) {
  const {
    stage,
    planLabel,
    context,
    roadmap,
    today,
    logs,
    businessProject,
    onStartOnboarding,
    onSubmitOnboarding,
    onOpenPlan,
    onGoMission,
    onAskCommit,
    onFeedbackDone,
    onFeedbackNotYet,
    onSubmitFeedback,
    onGenerateNext,
    onOpenParcours,
  } = props;

  const planTier: PlanTier = tierFromPlanLabel(planLabel);
  const planLimits = getCoachPlanLimits(planTier);

  // ===== WELCOME
  if (stage === "WELCOME") {
    const doneCount = logs.filter((l) => l.done).length;
    const pct = Math.min(100, Math.round((doneCount / 7) * 100));

    return (
      <div className="rounded-3xl border border-[#2a2416] bg-[#0b0f16]/70 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-3xl font-semibold text-yellow-400">
              Alex V2 · Coach IA
            </div>
            <div className="mt-1 text-sm text-white/55">
              MMR · MLR · Contenu — Focus Instagram. Résultats mesurés.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Pill>Instagram</Pill>
            <Pill>Ventes</Pill>
            <Pill>Workflow</Pill>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#2a2416] bg-black/20 p-5">
            <div className="text-white/85 font-semibold">Bon retour 👋</div>
            <div className="mt-1 text-sm text-white/55">
              {today
                ? `Mission en cours : Semaine ${today.weekIndex} · Jour ${today.dayIndex}`
                : "Tu peux reprendre là où tu t’es arrêté."}
            </div>

            <div className="mt-4">
              <div className="text-xs text-white/50">Progression semaine</div>
              <div className="mt-2 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-yellow-400"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-white/55">{doneCount}/7</div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={onGoMission}
                className="flex-1 rounded-2xl bg-yellow-400 px-4 py-3 text-sm font-semibold text-black hover:bg-yellow-300 transition"
              >
                Reprendre la mission
              </button>
              <button
                onClick={onOpenParcours}
                className="flex-1 rounded-2xl border border-[#2a2416] bg-black/20 px-4 py-3 text-sm text-white/75 hover:border-yellow-400/30 hover:text-yellow-200 transition"
              >
                Voir mon parcours
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[#2a2416] bg-black/20 p-5">
            <div className="text-white/85 font-semibold">Nouveau ici ?</div>
            <div className="mt-1 text-sm text-white/55">
              2 minutes pour démarrer. Aucun blabla.
            </div>

            <button
              onClick={onStartOnboarding}
              className="mt-5 w-full rounded-2xl border border-yellow-400/40 bg-yellow-400/10 px-4 py-3 text-sm font-semibold text-yellow-200 hover:bg-yellow-400/15 transition"
            >
              Commencer le parcours
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== ONBOARDING
  if (stage === "ONBOARDING") {
    return (
      <OnboardingCard
        onSubmit={onSubmitOnboarding}
        businessProject={businessProject || null}
      />
    );
  }

  // ===== PLAN
  if (stage === "PLAN_OVERVIEW") {
    return (
      <PlanOverview
        roadmap={roadmap}
        planTier={planTier}
        planLimits={planLimits}
        onStart={onGoMission}
        onRegen={onStartOnboarding}
      />
    );
  }

  // ===== MISSION
  if (stage === "MISSION_TODAY") {
    return (
      <MissionCard
        today={today}
        onAskCommit={onAskCommit}
        onOpenParcours={onOpenParcours}
      />
    );
  }

  // ===== FEEDBACK
  if (stage === "FEEDBACK") {
    return (
      <FeedbackCard
        today={today}
        onDone={onFeedbackDone}
        onNotYet={onFeedbackNotYet}
        onSubmit={onSubmitFeedback}
      />
    );
  }

  // ===== OPTIMIZE
  if (stage === "OPTIMIZE") {
    return (
      <OptimizeCard
        today={today}
        logs={logs}
        ctx={context}
        planLimits={planLimits}
        onNext={onGenerateNext}
      />
    );
  }

  // EXECUTION / COMMIT_REQUIRED are handled by Shell (modal + redirect)
  return (
    <div className="rounded-3xl border border-[#2a2416] bg-[#0b0f16]/70 p-6">
      <div className="text-white/80">Chargement…</div>
    </div>
  );
}

function OnboardingCard(props: {
  businessProject: FormActionBusinessProject | null;
  onSubmit: (data: {
    intent: AlexIntent;
    level: AlexLevel;
    timePerDay: TimePerDay;
    businessGoal: AlexBusinessGoal;
    businessModel: AlexBusinessModel;
    audienceSize: AlexAudienceSize;
    mainBlocker: AlexMainBlocker;
    offerDescription: string;
    targetAudienceDescription: string;
    primaryChannel: string;
    channelNotes: string;
    formActionProject: FormActionBusinessProject;
  }) => void;
}) {
  const { businessProject, onSubmit } = props;
  const [step, setStep] = useState(0);
  const [intent, setIntent] = useState<AlexIntent>("argent_vite");
  const [level, setLevel] = useState<AlexLevel>("debutant");
  const [timePerDay, setTimePerDay] = useState<TimePerDay>(30);
  const [businessGoal, setBusinessGoal] =
    useState<AlexBusinessGoal>("premiers_revenus");
  const [businessModel, setBusinessModel] = useState<AlexBusinessModel>(
    (businessProject?.businessModel as AlexBusinessModel) || "affiliation",
  );
  const [audienceSize, setAudienceSize] =
    useState<AlexAudienceSize>("moins_500");
  const [mainBlocker, setMainBlocker] = useState<AlexMainBlocker>("dispersion");
  const [offerDescription, setOfferDescription] = useState(
    businessProject?.offerDescription || "",
  );
  const [problemSolved, setProblemSolved] = useState(
    businessProject?.problemSolved || "",
  );
  const [transformationPromise, setTransformationPromise] = useState(
    businessProject?.transformationPromise || "",
  );
  const [targetAudienceDescription, setTargetAudienceDescription] = useState(
    businessProject?.targetAudienceDescription || "",
  );
  const [positioning, setPositioning] = useState(
    businessProject?.positioning || "mentor",
  );
  const [primaryChannel, setPrimaryChannel] = useState("instagram");
  const [firstRevenueGoal, setFirstRevenueGoal] = useState(
    businessProject?.firstRevenueGoal || "1 première vente",
  );
  const [channelNotes, setChannelNotes] = useState("");
  const targetEditedRef = useRef(
    Boolean(businessProject?.targetAudienceDescription),
  );
  const problemEditedRef = useRef(Boolean(businessProject?.problemSolved));
  const promiseEditedRef = useRef(Boolean(businessProject?.transformationPromise));

  useEffect(() => {
    if (problemEditedRef.current) return;
    const inferred = inferProblemSolved(offerDescription, businessModel);
    if (!offerDescription) return;
    setProblemSolved(inferred);
  }, [offerDescription, businessModel]);

  useEffect(() => {
    if (promiseEditedRef.current) return;
    if (!offerDescription) return;
    const inferred = inferTransformationPromise({
      offerDescription,
      problemSolved: problemSolved || inferProblemSolved(offerDescription, businessModel),
      businessGoal,
      businessModel,
    });
    setTransformationPromise(inferred);
  }, [offerDescription, problemSolved, businessGoal, businessModel]);

  useEffect(() => {
    if (targetEditedRef.current) return;
    const inferred = inferTargetAudienceFromOffer(
      offerDescription,
      businessModel,
      businessGoal,
      level,
      audienceSize,
      mainBlocker,
      problemSolved,
    );
    if (!inferred) return;
    setTargetAudienceDescription(inferred);
  }, [
    offerDescription,
    businessModel,
    businessGoal,
    level,
    audienceSize,
    mainBlocker,
    problemSolved,
  ]);

  const formActionProject = useMemo(
    () =>
      inferFormActionProject({
        offerDescription,
        problemSolved,
        transformationPromise,
        targetAudienceDescription,
        businessModel,
        businessGoal,
        level,
        audienceSize,
        mainBlocker,
        primaryChannel,
        positioning,
        firstRevenueGoal,
      }),
    [
      offerDescription,
      problemSolved,
      transformationPromise,
      targetAudienceDescription,
      businessModel,
      businessGoal,
      level,
      audienceSize,
      mainBlocker,
      primaryChannel,
      positioning,
      firstRevenueGoal,
    ],
  );

  const totalSteps = 10;

  function regenerateAvatar() {
    targetEditedRef.current = false;
    setTargetAudienceDescription(
      inferTargetAudienceFromOffer(
        offerDescription,
        businessModel,
        businessGoal,
        level,
        audienceSize,
        mainBlocker,
        problemSolved,
      ),
    );
  }

  function submitOnboarding() {
    onSubmit({
      intent,
      level,
      timePerDay,
      businessGoal,
      businessModel,
      audienceSize,
      mainBlocker,
      offerDescription,
      targetAudienceDescription,
      primaryChannel,
      channelNotes,
      formActionProject,
    });
  }

  return (
    <div className="rounded-3xl border border-[#2a2416] bg-[#0b0f16]/70 p-6">
      <div className="text-3xl font-semibold text-yellow-400">
        Coach Alex V3 · FormAction Premium
      </div>
      <div className="mt-1 text-sm text-white/55">
        Alex ne collecte plus seulement des réponses : il construit la mémoire
        marketing centrale de ton projet.
      </div>

      <div className="mt-5 rounded-2xl border border-yellow-500/20 bg-yellow-400/5 p-4">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-yellow-300/80">
          Étape {step + 1}/{totalSteps}
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-yellow-400"
            style={{ width: `${Math.round(((step + 1) / totalSteps) * 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-[#2a2416] bg-black/20 p-5">
        {step === 0 ? (
          <>
            <div className="text-white/85 font-semibold">
              Quel est ton projet principal ?
            </div>
            <div className="mt-2 text-sm text-white/50">
              Alex adapte tout le parcours selon ce choix.
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <PickRow
                checked={businessModel === "offre_digitale"}
                onClick={() => setBusinessModel("offre_digitale")}
                label="Créer mon propre produit digital"
              />
              <PickRow
                checked={businessModel === "affiliation"}
                onClick={() => setBusinessModel("affiliation")}
                label="Vendre une formation en MRR ou en affiliation"
              />
              <PickRow
                checked={businessModel === "coaching"}
                onClick={() => setBusinessModel("coaching")}
                label="Vendre du coaching ou de l’accompagnement"
              />
              <PickRow
                checked={businessModel === "contenu"}
                onClick={() => setBusinessModel("contenu")}
                label="Construire une audience puis monétiser"
              />
              <PickRow
                checked={businessModel === "pas_encore"}
                onClick={() => setBusinessModel("pas_encore")}
                label="Je ne sais pas encore"
              />
            </div>
          </>
        ) : step === 1 ? (
          <>
            <div className="text-white/85 font-semibold">
              Quel objectif veux-tu atteindre en priorité ?
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <PickRow
                checked={businessGoal === "premiers_revenus"}
                onClick={() => {
                  setBusinessGoal("premiers_revenus");
                  setFirstRevenueGoal("1 première vente");
                }}
                label="Obtenir mes premiers revenus"
              />
              <PickRow
                checked={businessGoal === "revenu_500"}
                onClick={() => {
                  setBusinessGoal("revenu_500");
                  setFirstRevenueGoal("500€/mois");
                }}
                label="Atteindre 500€/mois"
              />
              <PickRow
                checked={businessGoal === "premiers_clients"}
                onClick={() => {
                  setBusinessGoal("premiers_clients");
                  setFirstRevenueGoal("3 premiers clients");
                }}
                label="Trouver mes premiers clients"
              />
              <PickRow
                checked={businessGoal === "quitter_job"}
                onClick={() => {
                  setBusinessGoal("quitter_job");
                  setFirstRevenueGoal("revenu complémentaire stable");
                }}
                label="Préparer une sortie progressive du salariat"
              />
              <PickRow
                checked={businessGoal === "business_stable"}
                onClick={() => {
                  setBusinessGoal("business_stable");
                  setFirstRevenueGoal("business stable et répétable");
                }}
                label="Construire un business stable"
              />
            </div>
          </>
        ) : step === 2 ? (
          <>
            <div className="text-white/85 font-semibold">
              Description de l’offre
            </div>
            <div className="mt-2 text-sm text-white/50">
              Décris ce que tu veux vendre, promouvoir ou construire. Plus tu es
              précis, plus Alex devient puissant.
            </div>
            <textarea
              value={offerDescription}
              onChange={(e) => setOfferDescription(e.target.value)}
              placeholder="Exemple : une formation en affiliation autour de Code Liberté pour aider des débutants bloqués avec les formations MRR à obtenir leurs premières ventes..."
              className="mt-3 w-full rounded-2xl border border-[#2a2416] bg-black/20 p-4 text-sm leading-6 text-white outline-none focus:border-yellow-400/40"
              rows={7}
            />
          </>
        ) : step === 3 ? (
          <>
            <div className="text-white/85 font-semibold">
              Quel problème règles-tu ?
            </div>
            <div className="mt-2 text-sm text-white/50">
              Alex le préremplit depuis ton offre. Corrige seulement si besoin.
            </div>
            <textarea
              value={problemSolved}
              onChange={(e) => {
                problemEditedRef.current = true;
                setProblemSolved(e.target.value);
              }}
              className="mt-3 w-full rounded-2xl border border-[#2a2416] bg-black/20 p-4 text-sm leading-6 text-white outline-none focus:border-yellow-400/40"
              rows={5}
            />
          </>
        ) : step === 4 ? (
          <>
            <div className="text-white/85 font-semibold">
              Quelle transformation promets-tu ?
            </div>
            <div className="mt-2 text-sm text-white/50">
              Ce bloc servira plus tard aux pages de vente, emails, posts et
              scripts de conversion.
            </div>
            <textarea
              value={transformationPromise}
              onChange={(e) => {
                promiseEditedRef.current = true;
                setTransformationPromise(e.target.value);
              }}
              className="mt-3 w-full rounded-2xl border border-[#2a2416] bg-black/20 p-4 text-sm leading-6 text-white outline-none focus:border-yellow-400/40"
              rows={5}
            />
          </>
        ) : step === 5 ? (
          <>
            <div className="text-white/85 font-semibold">
              Ton niveau actuel
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <PickRow
                checked={level === "debutant"}
                onClick={() => setLevel("debutant")}
                label="Je débute totalement"
              />
              <PickRow
                checked={level === "sans_resultat"}
                onClick={() => setLevel("sans_resultat")}
                label="J’ai déjà essayé sans résultat"
              />
              <PickRow
                checked={level === "quelques_ventes"}
                onClick={() => setLevel("quelques_ventes")}
                label="J’ai déjà fait quelques ventes"
              />
            </div>

            <div className="mt-5 text-white/85 font-semibold">
              Ton audience actuelle
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <PickRow
                checked={audienceSize === "zero"}
                onClick={() => setAudienceSize("zero")}
                label="Je pars de zéro"
              />
              <PickRow
                checked={audienceSize === "moins_500"}
                onClick={() => setAudienceSize("moins_500")}
                label="Moins de 500 abonnés"
              />
              <PickRow
                checked={audienceSize === "500_5000"}
                onClick={() => setAudienceSize("500_5000")}
                label="Entre 500 et 5 000 abonnés"
              />
              <PickRow
                checked={audienceSize === "plus_5000"}
                onClick={() => setAudienceSize("plus_5000")}
                label="Plus de 5 000 abonnés"
              />
            </div>
          </>
        ) : step === 6 ? (
          <>
            <div className="text-white/85 font-semibold">
              Ton blocage principal aujourd’hui
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <PickRow
                checked={mainBlocker === "dispersion"}
                onClick={() => setMainBlocker("dispersion")}
                label="Je me disperse trop"
              />
              <PickRow
                checked={mainBlocker === "temps"}
                onClick={() => setMainBlocker("temps")}
                label="Je manque de temps"
              />
              <PickRow
                checked={mainBlocker === "technique"}
                onClick={() => setMainBlocker("technique")}
                label="Je bloque sur la technique"
              />
              <PickRow
                checked={mainBlocker === "vente"}
                onClick={() => setMainBlocker("vente")}
                label="Je ne sais pas vendre"
              />
              <PickRow
                checked={mainBlocker === "confiance"}
                onClick={() => setMainBlocker("confiance")}
                label="Je manque de confiance"
              />
            </div>

            <div className="mt-5 text-white/85 font-semibold">
              Pourquoi tu veux réussir maintenant ?
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <PickRow
                checked={intent === "argent_vite"}
                onClick={() => setIntent("argent_vite")}
                label="Gagner de l’argent rapidement"
              />
              <PickRow
                checked={intent === "quitter_job"}
                onClick={() => setIntent("quitter_job")}
                label="Quitter mon travail à terme"
              />
              <PickRow
                checked={intent === "complement"}
                onClick={() => setIntent("complement")}
                label="Créer un complément de revenu"
              />
              <PickRow
                checked={intent === "discipline"}
                onClick={() => setIntent("discipline")}
                label="Arrêter de procrastiner"
              />
            </div>
          </>
        ) : step === 7 ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-white/85 font-semibold">
                  Avatar marketing premium
                </div>
                <div className="mt-2 text-sm text-white/50">
                  Alex préremplit le client idéal avec un vrai avatar exploitable
                  par tout LGD.
                </div>
              </div>
              <button
                type="button"
                onClick={regenerateAvatar}
                className="shrink-0 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-xs font-semibold text-yellow-200 hover:bg-yellow-400/15 transition"
              >
                Régénérer
              </button>
            </div>
            <textarea
              value={targetAudienceDescription}
              onChange={(e) => {
                targetEditedRef.current = true;
                setTargetAudienceDescription(e.target.value);
              }}
              className="mt-3 w-full rounded-2xl border border-[#2a2416] bg-black/20 p-4 text-sm leading-6 text-white outline-none focus:border-yellow-400/40"
              rows={18}
            />
            <div className="mt-3 rounded-2xl border border-yellow-500/15 bg-yellow-400/5 p-3 text-xs leading-5 text-white/60">
              Ce bloc devient la mémoire marketing centrale : Coach Alex, CMO IA,
              Lead Engine, posts, emailing et pages de vente pourront l’exploiter.
            </div>
          </>
        ) : step === 8 ? (
          <>
            <div className="text-white/85 font-semibold">
              Positionnement et canal prioritaire
            </div>
            <div className="mt-2 text-sm text-white/50">
              Alex choisit une stratégie concentrée, pas une dispersion sur tous
              les réseaux.
            </div>

            <div className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300/70">
              Tu veux être perçu comme
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2">
              {["expert", "mentor", "coach", "créateur", "entrepreneur", "marque personnelle"].map((item) => (
                <PickRow
                  key={item}
                  checked={positioning === item}
                  onClick={() => setPositioning(item)}
                  label={item.charAt(0).toUpperCase() + item.slice(1)}
                />
              ))}
            </div>

            <div className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300/70">
              Canal prioritaire
            </div>
            <input
              value={primaryChannel}
              onChange={(e) => setPrimaryChannel(e.target.value)}
              className="mt-3 w-full rounded-2xl border border-[#2a2416] bg-black/20 p-4 text-sm text-white outline-none focus:border-yellow-400/40"
            />

            <div className="mt-3 rounded-2xl border border-[#2a2416] bg-black/20 p-4 text-xs leading-5 text-white/60">
              <span className="font-semibold text-yellow-200">
                Recommandation Alex :
              </span>{" "}
              {formActionProject.recommendedPlatform}.{" "}
              {formActionProject.platformReason}
            </div>
          </>
        ) : (
          <>
            <div className="text-white/85 font-semibold">
              Validation FormAction
            </div>
            <div className="mt-2 text-sm text-white/50">
              Alex a compris ton projet et prépare la première mission utile.
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3">
              <SummaryLine label="Parcours" value={parcoursLabel(formActionProject.parcours)} />
              <SummaryLine label="Modèle" value={labelBusinessModel(businessModel)} />
              <SummaryLine label="Objectif" value={firstRevenueGoal || labelBusinessGoal(businessGoal)} />
              <SummaryLine label="Niveau" value={labelLevel(level)} />
              <SummaryLine label="Audience" value={labelAudienceSize(audienceSize)} />
              <SummaryLine label="Blocage prioritaire" value={labelBlocker(mainBlocker)} />
              <SummaryLine label="Plateforme recommandée" value={formActionProject.recommendedPlatform || "Instagram"} />
              <SummaryLine label="Temps estimé avant mise en vente" value={formActionProject.estimatedTimeBeforeSale || "7 jours"} />
              <SummaryLine label="Score de clarté offre" value={`${formActionProject.offerReadinessScore || 0}/100`} />
            </div>

            <div className="mt-5 rounded-2xl border border-yellow-500/20 bg-yellow-400/5 p-4">
              <div className="text-sm font-semibold text-yellow-200">
                🧠 Ce qu’Alex a compris
              </div>
              <div className="mt-3 space-y-3 text-sm leading-6 text-white/70">
                <p>
                  Ton projet prioritaire est :{" "}
                  <span className="text-white">{parcoursLabel(formActionProject.parcours)}</span>.
                  Alex doit concentrer tes actions sur{" "}
                  <span className="text-white">{formActionProject.recommendedPlatform}</span>.
                </p>
                <p>
                  Ton offre doit résoudre :{" "}
                  <span className="text-white">{problemSolved || "un problème clair à préciser"}</span>
                </p>
                <p>
                  Ton angle de contenu :{" "}
                  <span className="text-white">{formActionProject.contentAngle}</span>
                </p>
                <p>
                  Ton angle de vente :{" "}
                  <span className="text-white">{formActionProject.salesAngle}</span>
                </p>
                <p>
                  Mission suivante préparée :{" "}
                  <span className="text-white">{formActionProject.nextMission}</span>
                </p>
              </div>
            </div>

            <div className="mt-5 text-white/85 font-semibold">
              Temps disponible par jour
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <PickRow
                checked={timePerDay === 30}
                onClick={() => setTimePerDay(30)}
                label="30 minutes"
              />
              <PickRow
                checked={timePerDay === 60}
                onClick={() => setTimePerDay(60)}
                label="1 heure"
              />
              <PickRow
                checked={timePerDay === 90}
                onClick={() => setTimePerDay(90)}
                label="1h30+"
              />
            </div>
          </>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className={
              "rounded-2xl border px-4 py-3 text-sm transition " +
              (step === 0
                ? "border-white/10 bg-white/5 text-white/30"
                : "border-[#2a2416] bg-black/20 text-white/75 hover:border-yellow-400/30 hover:text-yellow-200")
            }
          >
            Retour
          </button>

          {step < totalSteps - 1 ? (
            <button
              onClick={() => setStep((s) => Math.min(totalSteps - 1, s + 1))}
              className="rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-300 transition"
            >
              Continuer
            </button>
          ) : (
            <button
              onClick={submitOnboarding}
              className="rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-300 transition"
            >
              Valider et générer ma trajectoire
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-[#2a2416] bg-black/10 p-4">
        <div className="text-xs text-white/50">Coach Alex V3 FormAction</div>
        <div className="mt-1 text-sm text-white/70">
          Une seule mémoire projet. Une seule direction. Une mission suivante
          exploitable par tout LGD.
        </div>
      </div>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#2a2416] bg-black/20 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-white/35">
        {label}
      </div>
      <div className="mt-1 text-sm text-white/75">{value}</div>
    </div>
  );
}

function PickRow(props: {
  checked: boolean;
  label: string;
  onClick: () => void;
}) {
  const { checked, label, onClick } = props;
  return (
    <button
      onClick={onClick}
      className={
        "w-full rounded-2xl border px-4 py-3 text-left text-sm transition " +
        (checked
          ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-200"
          : "border-[#2a2416] bg-black/15 text-white/75 hover:border-yellow-400/30 hover:text-yellow-200")
      }
    >
      {label}
    </button>
  );
}

function PlanOverview(props: {
  roadmap: AlexRoadmap | null;
  planTier: PlanTier;
  planLimits: ReturnType<typeof getCoachPlanLimits>;
  onStart: () => void;
  onRegen: () => void;
}) {
  const { roadmap, planTier, planLimits, onStart, onRegen } = props;
  const regenCheck = useMemo(() => canRegenPlan(planLimits), [planLimits]);
  const upgradeHint = useMemo(
    () => getUpgradeHintForPlanRegen(planTier),
    [planTier],
  );

  return (
    <div className="rounded-3xl border border-[#2a2416] bg-[#0b0f16]/70 p-6">
      <div className="text-3xl font-semibold text-yellow-400">
        Ton plan global
      </div>
      <div className="mt-1 text-sm text-white/55">
        Non éditable. Tu exécutes, tu mesures, tu avances.
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {(roadmap?.weeks || []).slice(0, 4).map((w) => (
          <div
            key={w.weekIndex}
            className="rounded-2xl border border-[#2a2416] bg-black/20 p-5"
          >
            <div className="text-white/85 font-semibold">
              Semaine {w.weekIndex}
            </div>
            <div className="mt-1 text-sm text-white/55">{w.label}</div>
            <div className="mt-3 space-y-2">
              {w.days.slice(0, 3).map((d) => (
                <div key={d.dayIndex} className="text-sm text-white/65">
                  <span className="text-white/45">Jour {d.dayIndex} :</span>{" "}
                  {d.title}
                </div>
              ))}
              <div className="text-xs text-white/45">
                + {Math.max(0, w.days.length - 3)} autres jours…
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={onStart}
          className="flex-1 rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-300 transition"
        >
          Commencer aujourd’hui
        </button>
        <button
          onClick={() => {
            const ok = canRegenPlan(planLimits);
            if (!ok.ok) return;
            commitPlanRegen(planLimits);
            onRegen();
          }}
          disabled={!regenCheck.ok}
          className={
            "flex-1 rounded-2xl border px-5 py-3 text-sm transition " +
            (regenCheck.ok
              ? "border-[#2a2416] bg-black/20 text-white/75 hover:border-yellow-400/30 hover:text-yellow-200"
              : "border-white/10 bg-white/5 text-white/35 cursor-not-allowed")
          }
        >
          Recommencer (onboarding)
        </button>
      </div>

      {!regenCheck.ok ? (
        <div className="mt-3 rounded-2xl border border-[#2a2416] bg-black/10 p-4">
          <div className="text-sm text-yellow-200 font-semibold">
            {upgradeHint?.title || "Limite atteinte"}
          </div>
          <div className="mt-1 text-sm text-white/55">
            {upgradeHint?.body ||
              "Tu pourras relancer ton onboarding plus tard selon ton plan."}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MissionCard(props: {
  today: AlexToday | null;
  onAskCommit: () => void;
  onOpenParcours: () => void;
}) {
  const { today, onAskCommit, onOpenParcours } = props;

  return (
    <div className="rounded-3xl border border-[#2a2416] bg-[#0b0f16]/70 p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-2xl font-semibold text-yellow-400">
            🎯 Ce que tu dois faire aujourd’hui
          </div>
          <div className="mt-1 text-sm text-white/55">
            Objectif business. Pas de bavardage.
          </div>
        </div>
        <button
          onClick={onOpenParcours}
          className="rounded-2xl border border-[#2a2416] bg-black/20 px-4 py-2 text-sm text-white/70 hover:border-yellow-400/30 hover:text-yellow-200 transition"
        >
          Mon parcours
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-[#2a2416] bg-black/20 p-5">
        <div className="text-yellow-200 text-lg font-semibold">
          {today?.mission.title || "—"}
        </div>
        <div className="mt-1 text-xs text-white/50">
          {today ? `Semaine ${today.weekIndex} · Jour ${today.dayIndex}` : ""}
        </div>
        <div className="mt-3 text-sm text-white/70">
          {today?.mission.objective || ""}
        </div>

        {today?.mission.checklist?.length ? (
          <div className="mt-4 space-y-2">
            {today.mission.checklist.map((it, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-sm text-white/70"
              >
                <span className="mt-[3px] inline-block h-2 w-2 rounded-full bg-yellow-400/80" />
                <span>{it}</span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[#2a2416] bg-black/15 p-4">
            <div className="text-xs text-white/50">KPI</div>
            <div className="mt-1 text-sm text-white/80">
              {today?.mission.kpiLabel || "—"}
            </div>
          </div>
          <div className="rounded-2xl border border-[#2a2416] bg-black/15 p-4">
            <div className="text-xs text-white/50">Durée</div>
            <div className="mt-1 text-sm text-white/80">
              {today ? `${today.mission.durationMin} min` : "—"}
            </div>
          </div>
        </div>

        <button
          onClick={onAskCommit}
          className="mt-5 w-full rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-300 transition"
        >
          🚀 Exécuter maintenant.
        </button>

        <div className="mt-3 text-xs text-white/45">
          Accès à l’éditeur intelligent uniquement après validation.
        </div>
      </div>
    </div>
  );
}

function FeedbackCard(props: {
  today: AlexToday | null;
  onDone: () => void;
  onNotYet: () => void;
  onSubmit: (data: {
    done: boolean;
    kpiValue: number;
    blocker: DailyLog["blocker"];
  }) => void;
}) {
  const { today, onDone, onNotYet, onSubmit } = props;
  const [answered, setAnswered] = useState<null | boolean>(null);
  const [kpiValue, setKpiValue] = useState<number>(0);
  const [blocker, setBlocker] = useState<DailyLog["blocker"] | null>(null);

  return (
    <div className="rounded-3xl border border-[#2a2416] bg-[#0b0f16]/70 p-6">
      <div className="text-3xl font-semibold text-yellow-400">Feedback</div>
      <div className="mt-1 text-sm text-white/55">
        30 secondes. On mesure. On optimise.
      </div>

      <div className="mt-6 rounded-2xl border border-[#2a2416] bg-black/20 p-5">
        <div className="text-white/85 font-semibold">Mission terminée ?</div>
        <div className="mt-1 text-sm text-white/55">
          {today?.mission.title || ""}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              setAnswered(true);
              onDone();
            }}
            className={
              "rounded-2xl border px-4 py-3 text-sm font-semibold transition " +
              (answered === true
                ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-200"
                : "border-[#2a2416] bg-black/15 text-white/75 hover:border-yellow-400/30 hover:text-yellow-200")
            }
          >
            Oui
          </button>
          <button
            onClick={() => {
              setAnswered(false);
              onNotYet();
            }}
            className={
              "rounded-2xl border px-4 py-3 text-sm font-semibold transition " +
              (answered === false
                ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-200"
                : "border-[#2a2416] bg-black/15 text-white/75 hover:border-yellow-400/30 hover:text-yellow-200")
            }
          >
            Pas encore
          </button>
        </div>

        {answered === true ? (
          <>
            <div className="mt-5 rounded-2xl border border-[#2a2416] bg-black/15 p-4">
              <div className="text-sm text-white/70">
                {today?.mission.kpiLabel || "KPI"}
              </div>
              <input
                type="number"
                value={Number.isFinite(kpiValue) ? kpiValue : 0}
                onChange={(e) => setKpiValue(Number(e.target.value || 0))}
                className="mt-2 w-full rounded-2xl border border-[#2a2416] bg-[#070a10] px-4 py-3 text-sm text-white outline-none focus:border-yellow-400/40"
                placeholder="0"
              />
            </div>

            <div className="mt-4 rounded-2xl border border-[#2a2416] bg-black/15 p-4">
              <div className="text-sm text-white/70">Blocage principal</div>
              <div className="mt-3 grid grid-cols-1 gap-2">
                <PickRow
                  checked={blocker === "idees"}
                  onClick={() => setBlocker("idees")}
                  label="Trouver des idées"
                />
                <PickRow
                  checked={blocker === "oser"}
                  onClick={() => setBlocker("oser")}
                  label="Oser publier"
                />
                <PickRow
                  checked={blocker === "pas_de_reponses"}
                  onClick={() => setBlocker("pas_de_reponses")}
                  label="Personne ne répond"
                />
                <PickRow
                  checked={blocker === "temps"}
                  onClick={() => setBlocker("temps")}
                  label="Manque de temps"
                />
                <PickRow
                  checked={blocker === "message"}
                  onClick={() => setBlocker("message")}
                  label="Je ne savais pas quoi dire"
                />
                <PickRow
                  checked={blocker === "autre"}
                  onClick={() => setBlocker("autre")}
                  label="Aucun blocage"
                />
              </div>
            </div>

            <button
              onClick={() =>
                onSubmit({ done: true, kpiValue, blocker: blocker ?? "autre" })
              }
              className="mt-5 w-full rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-300 transition"
            >
              Valider
            </button>
          </>
        ) : answered === false ? (
          <div className="mt-4 rounded-2xl border border-[#2a2416] bg-black/15 p-4">
            <div className="text-sm text-white/70">
              OK. Reviens une fois la mission terminée.
            </div>
            <div className="mt-1 text-xs text-white/50">
              Alex te remettra exactement sur cette mission.
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function OptimizeCard(props: {
  today: AlexToday | null;
  logs: DailyLog[];
  ctx: AlexContext | null;
  planLimits: ReturnType<typeof getCoachPlanLimits>;
  onNext: () => void;
}) {
  const { today, logs, ctx, planLimits, onNext } = props;

  const lastDone = useMemo(
    () =>
      logs
        .slice()
        .reverse()
        .find((l) => l.done),
    [logs],
  );

  const blockerKey = (lastDone?.blocker ?? null) as DailyLog["blocker"] | null;
  const hasBlocker = blockerKey !== null && blockerKey !== "autre";

  const behaviorTags = useMemo(() => {
    try {
      return getBehaviorTags(ctx, logs);
    } catch {
      return [];
    }
  }, [ctx, logs]);

  const rec = useMemo(() => {
    if (!hasBlocker) return null;
    try {
      return makeOptimizationRecFromBlocker(blockerKey as DailyLog["blocker"]);
    } catch {
      return null;
    }
  }, [hasBlocker, blockerKey, behaviorTags]);

  const applyToEditor = () => {
    if (!rec) return;
    try {
      const briefId =
        "opt_" +
        Math.random().toString(36).slice(2) +
        "_" +
        Date.now().toString(36);
      const payload = {
        source: "coach-alex-v2",
        network: "instagram",
        objective: "ventes_mmr_mlr",
        blocker: blockerKey,
        tags: behaviorTags,
        recommendationTitle: rec.title,
        cause: rec.cause,
        action: rec.action,
        brief: rec.brief,
        editorMode: rec.editorMode,
        createdAtISO: new Date().toISOString(),
        briefId,
      };
      localStorage.setItem(
        "lgd_editor_intelligent_brief",
        JSON.stringify(payload),
      );
    } catch {
      // ignore
    }
    window.location.href =
      "/dashboard/automatisations/reseaux_sociaux/editor-intelligent";
  };

  const analysis = useMemo(() => {
    if (!hasBlocker) {
      return {
        win: "Tu avances. Continue le rythme.",
        fix: "Mesure ton KPI chaque jour.",
        next: "On enchaîne avec la prochaine mission.",
      };
    }

    // We keep existing logic as a fallback, but behavior tags can slightly adjust the tone.
    const b = blockerKey;

    if (b === "message") {
      return {
        win: "Tu as exécuté. C’est ce qui compte.",
        fix: "Demain : un script plus simple, 1 question ouverte.",
        next: "On passe à une mission conversation guidée.",
      };
    }
    if (b === "pas_de_reponses") {
      return {
        win: "Tu es visible. On optimise le CTA.",
        fix: "Demain : hook + question + CTA DM plus clair.",
        next: "On améliore la conversion, pas le volume.",
      };
    }
    if (b === "idees") {
      return {
        win: "Tu as démarré. On structure.",
        fix: "Demain : 1 template simple (problème → solution → preuve).",
        next: "On enlève la friction d’inspiration.",
      };
    }
    if (b === "temps") {
      return {
        win: "Tu as identifié le vrai problème.",
        fix: "Demain : mission 20 minutes, 1 seule tâche.",
        next: "On privilégie la régularité.",
      };
    }
    if (b === "oser") {
      return {
        win: "Tu progresses. On sécurise.",
        fix: "Demain : format plus léger (story ou mini post).",
        next: "On gagne en confiance par petites victoires.",
      };
    }

    return {
      win: "Tu as exécuté. Bien.",
      fix: "Demain : on optimise un seul levier.",
      next: "On enchaîne.",
    };
  }, [hasBlocker, blockerKey]);

  if (!hasBlocker) {
    return (
      <div className="rounded-3xl border border-[#2a2416] bg-[#0b0f16]/70 p-6">
        <div className="text-3xl font-semibold text-yellow-400">
          Optimisation
        </div>
        <div className="mt-1 text-sm text-white/55">
          Aucun blocage détecté. Parfait — on garde le rythme.
        </div>

        <div className="mt-6 rounded-2xl border border-[#2a2416] bg-black/20 p-5">
          <div className="text-sm text-white/80 font-semibold">
            Ton ajustement pour demain
          </div>
          <div className="mt-2 text-sm text-white/60">
            Répète exactement le même mouvement. La régularité crée les ventes.
          </div>

          <div className="mt-4 rounded-2xl border border-[#2a2416] bg-black/10 p-4">
            <div className="text-xs text-white/50">Action</div>
            <div className="mt-2 text-sm text-white/80">
              Passe à la mission suivante.
            </div>
          </div>

          <button
            onClick={onNext}
            className="mt-5 w-full rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-300 transition"
          >
            Mission suivante
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-[#2a2416] bg-[#0b0f16]/70 p-6">
      <div className="text-3xl font-semibold text-yellow-400">Optimisation</div>
      <div className="mt-1 text-sm text-white/55">
        Alex ajuste ton focus. Réseau : Instagram. Modèles : MMR/MLR/Contenu.
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[#2a2416] bg-black/20 p-5">
          <div className="text-xs text-white/50">Ce qui a marché</div>
          <div className="mt-2 text-sm text-white/80">{analysis.win}</div>
        </div>
        <div className="rounded-2xl border border-[#2a2416] bg-black/20 p-5">
          <div className="text-xs text-white/50">À corriger</div>
          <div className="mt-2 text-sm text-white/80">{analysis.fix}</div>
        </div>
        <div className="rounded-2xl border border-[#2a2416] bg-black/20 p-5">
          <div className="text-xs text-white/50">Priorité</div>
          <div className="mt-2 text-sm text-white/80">{analysis.next}</div>
        </div>
      </div>

      {/* WOW card computed by Alex Behavior Engine */}
      {rec ? (
        <div className="mt-5 rounded-2xl border border-[#2a2416] bg-black/20 p-5">
          <div className="text-sm text-white/80 font-semibold">
            Ton ajustement pour demain
          </div>
          <div className="mt-2 text-sm text-white/60">{rec.title}</div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-[#2a2416] bg-black/10 p-4">
              <div className="text-xs text-white/50">Cause probable</div>
              <div className="mt-2 text-sm text-white/80">{rec.cause}</div>
            </div>
            <div className="rounded-2xl border border-[#2a2416] bg-black/10 p-4">
              <div className="text-xs text-white/50">Fix concret</div>
              <div className="mt-2 text-sm text-white/80">{rec.action}</div>
            </div>
            <div className="rounded-2xl border border-[#2a2416] bg-black/10 p-4">
              <div className="text-xs text-white/50">Action maintenant</div>
              <div className="mt-2 text-sm text-white/80">{rec.brief}</div>
            </div>
          </div>

          <button
            onClick={applyToEditor}
            className="mt-5 w-full rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-300 transition"
          >
            Appliquer dans l’éditeur intelligent
          </button>

          {planLimits.optimizeDepth <= 1 ? (
            <div className="mt-3 text-xs text-white/50">
              Astuce : passe en Pro/Ultime pour recevoir plus d’optimisations
              (hooks, scripts, closing).
            </div>
          ) : null}
        </div>
      ) : null}

      {planLimits.optimizeDepth >= 2 ? (
        <div className="mt-4 rounded-2xl border border-[#2a2416] bg-black/10 p-5">
          <div className="text-sm text-white/80 font-semibold">Boost Pro</div>
          <div className="mt-2 text-sm text-white/60">
            Ajout : 1 recommandation concrète (hook/CTA) pour augmenter les
            réponses.
          </div>
          <div className="mt-3 rounded-2xl border border-[#2a2416] bg-black/20 p-4">
            <div className="text-xs text-white/50">Action recommandée</div>
            <div className="mt-2 text-sm text-white/80">
              Teste 2 hooks différents sur le même sujet (A/B) et garde celui
              qui obtient le plus de commentaires/DM.
            </div>
          </div>
        </div>
      ) : null}

      {planLimits.optimizeDepth >= 3 ? (
        <div className="mt-4 rounded-2xl border border-[#2a2416] bg-black/10 p-5">
          <div className="text-sm text-white/80 font-semibold">
            Boost Ultime
          </div>
          <div className="mt-2 text-sm text-white/60">
            Ajout : plan de micro-optimisation (contenu → DM → closing) pour
            scaler.
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3">
            <div className="rounded-2xl border border-[#2a2416] bg-black/20 p-4">
              <div className="text-xs text-white/50">Contenu</div>
              <div className="mt-1 text-sm text-white/80">
                1 post valeur + 1 story question aujourd’hui.
              </div>
            </div>
            <div className="rounded-2xl border border-[#2a2416] bg-black/20 p-4">
              <div className="text-xs text-white/50">DM</div>
              <div className="mt-1 text-sm text-white/80">
                3 relances courtes (question ouverte + micro engagement).
              </div>
            </div>
            <div className="rounded-2xl border border-[#2a2416] bg-black/20 p-4">
              <div className="text-xs text-white/50">Closing</div>
              <div className="mt-1 text-sm text-white/80">
                Propose une étape suivante simple (audio/mini call).
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-6 rounded-2xl border border-[#2a2416] bg-black/15 p-5">
        <div className="text-sm text-white/70">Dernière mission</div>
        <div className="mt-2 text-lg font-semibold text-yellow-200">
          {today?.mission.title || "—"}
        </div>
        <div className="mt-1 text-sm text-white/55">
          Intent actuel :{" "}
          <span className="text-white/80 font-semibold">
            {ctx?.intent || "—"}
          </span>
        </div>
        {behaviorTags?.length ? (
          <div className="mt-2 text-xs text-white/45">
            Contexte Alex : {behaviorTags.join(" · ")}
          </div>
        ) : null}
      </div>

      <button
        onClick={onNext}
        className="mt-6 w-full rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-300 transition"
      >
        Générer la mission suivante
      </button>
    </div>
  );
}
