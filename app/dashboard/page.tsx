"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import CardLuxe from "@/components/ui/CardLuxe";
import LeadEngineBlock from "./components/LeadEngineBlock";

// Icons (react-icons/fa)
import {
  FaBolt,
  FaBook,
  FaCheckCircle,
  FaCircle,
  FaCrown,
  FaEnvelope,
  FaFilter,
  FaGem,
  FaLock,
  FaRobot,
  FaSyncAlt,
  FaTimes,
  FaUserAstronaut,
} from "react-icons/fa";

type Plan = "none" | "azur" | "essentiel" | "pro" | "ultime";

type ModalKey =
  | "editor"
  | "coach"
  | "affiliation"
  | "emailing"
  | "ebook"
  | "multiplier"
  | "offer"
  | "funnel"
  | "lead_engine";

type DailyProgress = {
  idea: boolean;
  content: boolean;
  email: boolean;
  offer: boolean;
};

type CmoDashboardResult = {
  diagnostic?: string;
  priority_action?: string;
  why_this_action?: string;
  next_best_action?: string;
  risk_to_avoid?: string;
  generated_content?: {
    post?: string;
    email?: string;
    cta?: string;
    lead_magnet_idea?: string;
  };
};

type CmoModuleTarget = {
  key: "coach" | "emailing" | "editor" | "lead_engine";
  label: string;
  path: string;
};

const CMO_AUTO_PAYLOAD_KEY = "lgd_cmo_module_auto_payload";


const SYSTEMEIO_PLANS_URL =
  process.env.NEXT_PUBLIC_SYSTEMEIO_PLANS_URL || "https://legenerateurdigital.systeme.io/lgd";
const SYSTEMEIO_TRIAL_URL =
  process.env.NEXT_PUBLIC_SYSTEMEIO_TRIAL_URL || "https://legenerateurdigital.systeme.io/trial";
const SYSTEMEIO_CREATE_ACCOUNT_URL =
  process.env.NEXT_PUBLIC_SYSTEMEIO_CREATE_ACCOUNT_URL || "https://legenerateurdigital.systeme.io/lgd";

const LOGIN_PATH = "/auth/login";

const LGD_DAILY_PROGRESS_KEY = "lgd_dashboard_daily_progress";

const DEFAULT_PROGRESS: DailyProgress = {
  idea: true,
  content: false,
  email: false,
  offer: false,
};

function planLabel(plan: Plan) {
  if (plan === "ultime") return "ULTIME";
  if (plan === "pro") return "PRO";
  if (plan === "essentiel") return "ESSENTIEL";
  if (plan === "azur") return "AZUR";
  return "VISITEUR";
}


function getStoredToken() {
  if (typeof window === "undefined") return "";
  return (
    window.localStorage.getItem("access_token") ||
    window.localStorage.getItem("lgd_token") ||
    window.localStorage.getItem("token") ||
    window.localStorage.getItem("jwt") ||
    ""
  );
}

async function fetchPlanFromBackend(): Promise<Plan> {
  const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");
  const url = `${base}/ai-quota/global`;

  const token = getStoredToken();
  if (!token) return "none";

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`ai-quota/global ${res.status}`);

  const data = (await res.json()) as any;
  const rawPlan = String(data?.display_plan || data?.plan || data?.current_plan || "").toLowerCase();
  const limit = Number(data?.tokens_limit || data?.limit_tokens || 0);

  if (rawPlan.includes("ultime")) return "ultime";
  if (rawPlan.includes("pro")) return "pro";
  if (rawPlan.includes("azur") || rawPlan.includes("trial") || rawPlan.includes("starter") || limit === 70000) return "azur";
  if (rawPlan.includes("essentiel") || limit === 400000) return "essentiel";
  return "none";
}


async function fetchCmoDashboardStrategy(): Promise<CmoDashboardResult> {
  const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");
  const token = getStoredToken();

  if (!token) {
    throw new Error("Token utilisateur introuvable.");
  }

  const res = await fetch(`${base}/cmo-ai/strategy`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      objective: "Aider l'utilisateur LGD à choisir l'action la plus rentable aujourd'hui pour obtenir ou accélérer ses ventes.",
      niche: "business en ligne, marketing digital, création de contenu, prospection",
      audience: "entrepreneurs, créateurs, indépendants et débutants qui veulent vendre avec l'IA",
      offer: "Le Générateur Digital",
      current_situation: "L'utilisateur arrive sur le dashboard LGD et doit savoir quoi faire maintenant.",
      constraints: "Réponse courte, actionnable, non technique, orientée vente. Une seule priorité.",
      preferred_channel: "Coach Alex, Emailing IA, Éditeur intelligent ou Lead Engine selon la meilleure action.",
      tone: "premium, humain, direct, motivant",
      user_level: "intermediate",
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`cmo-ai/strategy ${res.status}`);
  }

  const data = (await res.json()) as any;
  return (data?.result || data || {}) as CmoDashboardResult;
}



function getCmoModuleTarget(result: CmoDashboardResult | null): CmoModuleTarget {
  const text = [
    result?.priority_action,
    result?.next_best_action,
    result?.generated_content?.email,
    result?.generated_content?.post,
    result?.generated_content?.lead_magnet_idea,
    result?.generated_content?.cta,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (text.includes("email") || text.includes("mail") || text.includes("campagne") || text.includes("séquence")) {
    return {
      key: "emailing",
      label: "Créer avec Emailing IA",
      path: "/dashboard/email-campaigns",
    };
  }

  if (
    text.includes("lead magnet") ||
    text.includes("lead") ||
    text.includes("prospect") ||
    text.includes("landing") ||
    text.includes("capture")
  ) {
    return {
      key: "lead_engine",
      label: "Créer avec Leads IA",
      path: "/dashboard/lead-engine",
    };
  }

  if (
    text.includes("post") ||
    text.includes("contenu") ||
    text.includes("carrousel") ||
    text.includes("publication") ||
    text.includes("éditeur")
  ) {
    return {
      key: "editor",
      label: "Créer dans l’Éditeur",
      path: "/dashboard/automatisations/reseaux_sociaux/editor-intelligent",
    };
  }

  return {
    key: "coach",
    label: "Exécuter dans Coach Alex",
    path: "/dashboard/coach-ia",
  };
}


function getPlanFromLocalStorage(): Plan {
  if (typeof window === "undefined") return "none";
  const essentiel = localStorage.getItem("lgd_plan_essentiel");
  const pro = localStorage.getItem("lgd_plan_pro");
  const ultime = localStorage.getItem("lgd_plan_ultime");

  const trial = localStorage.getItem("lgd_plan_trial");
  const starter = localStorage.getItem("lgd_plan_starter");

  if (ultime === "active") return "ultime";
  if (pro === "active") return "pro";
  if (trial === "active" || starter === "active") return "azur";
  if (essentiel === "active") return "essentiel";
  return "none";
}

function readDailyProgress(): DailyProgress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;

  try {
    const raw = window.localStorage.getItem(LGD_DAILY_PROGRESS_KEY);
    if (!raw) return DEFAULT_PROGRESS;

    const parsed = JSON.parse(raw) as Partial<DailyProgress>;
    return {
      idea: Boolean(parsed.idea),
      content: Boolean(parsed.content),
      email: Boolean(parsed.email),
      offer: Boolean(parsed.offer),
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

function writeDailyProgress(progress: DailyProgress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LGD_DAILY_PROGRESS_KEY, JSON.stringify(progress));
}

function openExternal(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

function openSystemeioPlans() {
  openExternal(SYSTEMEIO_PLANS_URL);
}

function goToTrial() {
  openExternal(SYSTEMEIO_TRIAL_URL);
}

function goToRegister() {
  openExternal(SYSTEMEIO_CREATE_ACCOUNT_URL);
}

function goToLogin() {
  window.location.href = LOGIN_PATH;
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-yellow-600/25 bg-[#0b0b0b] px-4 py-1 text-[12px] text-white/75">
      {children}
    </span>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={[
        "w-full rounded-2xl px-5 py-3 font-semibold transition-all",
        "bg-gradient-to-r from-[#ffb800] to-[#ffcc4d] text-black",
        "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-500/20",
        disabled ? "opacity-60 cursor-not-allowed hover:translate-y-0" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl px-5 py-3 font-semibold border border-yellow-600/25 bg-[#0b0b0b] text-white/85 hover:bg-yellow-500/10 transition-all"
    >
      {children}
    </button>
  );
}

function LockBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-yellow-600/25 bg-[#0b0b0b] px-3 py-1 text-[12px] text-white/60">
      <FaLock className="text-yellow-300" />
      Connecte-toi pour utiliser
    </span>
  );
}

function ProgressItem({
  done,
  label,
  onClick,
}: {
  done?: boolean;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all",
        "hover:-translate-y-0.5",
        done
          ? "border-yellow-500/30 bg-yellow-500/10 text-white"
          : "border-yellow-600/15 bg-[#0b0b0b] text-white/75 hover:bg-yellow-500/5",
      ].join(" ")}
    >
      <div className="shrink-0">
        {done ? (
          <FaCheckCircle className="text-yellow-400 text-lg" />
        ) : (
          <FaCircle className="text-white/30 text-[12px]" />
        )}
      </div>
      <span className={done ? "text-white/95" : "text-white/70"}>{label}</span>
    </button>
  );
}

function ModalShell({
  open,
  title,
  subtitle,
  icon,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.99 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-2xl"
          >
            <div className="card-luxe rounded-2xl border border-yellow-600/20 bg-gradient-to-b from-[#111] to-[#0b0b0b] p-6 sm:p-8 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {icon ? (
                    <div className="mt-1 text-2xl text-yellow-400 drop-shadow-[0_0_12px_rgba(255,184,0,0.35)]">
                      {icon}
                    </div>
                  ) : null}
                  <div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-yellow-400">
                      {title}
                    </h3>
                    {subtitle ? (
                      <p className="mt-1 text-sm text-white/65">{subtitle}</p>
                    ) : null}
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="rounded-xl border border-yellow-600/25 px-3 py-2 text-yellow-200 hover:bg-yellow-500/10 transition-all"
                  aria-label="Fermer"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="mt-6">{children}</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [plan, setPlan] = useState<Plan>("none");
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalKey | null>(null);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>(DEFAULT_PROGRESS);
  const [progressHydrated, setProgressHydrated] = useState(false);
  const [cmoResult, setCmoResult] = useState<CmoDashboardResult | null>(null);
  const [cmoLoading, setCmoLoading] = useState(false);
  const [cmoError, setCmoError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const token = getStoredToken();
      if (!token) {
        if (!cancelled) {
          setIsLoggedIn(false);
          setPlan("none");
          setLoadingPlan(false);
        }
        return;
      }

      if (!cancelled) setIsLoggedIn(true);

      try {
        const p = await fetchPlanFromBackend();
        if (!cancelled) setPlan(p);
      } catch {
        const fallback = getPlanFromLocalStorage();
        if (!cancelled) setPlan(fallback);
      } finally {
        if (!cancelled) setLoadingPlan(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const saved = readDailyProgress();
    setDailyProgress(saved);
    setProgressHydrated(true);
  }, []);

  useEffect(() => {
    if (!progressHydrated) return;
    writeDailyProgress(dailyProgress);
  }, [dailyProgress, progressHydrated]);

  const hasPaidAccess = useMemo(() => isLoggedIn, [isLoggedIn]);

  const heroTitle =
    "Crée du contenu • Attire des prospects • Génère tes premières ventes avec l’IA";

  const cmoModuleTarget = useMemo(() => getCmoModuleTarget(cmoResult), [cmoResult]);

  const iconGlow =
    "text-4xl text-[#ffb800] drop-shadow-[0_0_12px_rgba(255,184,0,0.35)]";

  function openModal(key: ModalKey) {
    setActiveModal(key);
  }

  function closeModal() {
    setActiveModal(null);
  }

  function go(path: string) {
    router.push(path);
  }

  function accessOrExplain(key: "editor" | "coach" | "emailing" | "lead_engine") {
    if (!isLoggedIn) {
      openModal(key);
      return;
    }

    if (key === "coach") {
      go("/dashboard/coach-ia");
      return;
    }

    if (key === "editor") {
      markContentCreated();
      go("/dashboard/automatisations/reseaux_sociaux/editor-intelligent");
      return;
    }

    if (key === "emailing") {
      go("/dashboard/email-campaigns");
      return;
    }

    if (key === "lead_engine") {
      go("/dashboard/lead-engine");
      return;
    }
  }

  async function loadCmoLive() {
    setCmoLoading(true);
    setCmoError(null);

    try {
      const result = await fetchCmoDashboardStrategy();
      setCmoResult(result);
    } catch (error) {
      console.error(error);
      setCmoError("CMO IA indisponible pour le moment. Tu peux continuer avec Coach Alex.");
    } finally {
      setCmoLoading(false);
    }
  }

  function executeCmoModuleAuto() {
    const target = getCmoModuleTarget(cmoResult);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        CMO_AUTO_PAYLOAD_KEY,
        JSON.stringify({
          created_at: new Date().toISOString(),
          source: "dashboard_cmo_v5",
          target: target.key,
          priority_action: cmoResult?.priority_action || "",
          diagnostic: cmoResult?.diagnostic || "",
          why_this_action: cmoResult?.why_this_action || "",
          next_best_action: cmoResult?.next_best_action || "",
          generated_content: cmoResult?.generated_content || {},
        })
      );
    }

    if (target.key === "editor") {
      markContentCreated();
    }

    if (target.key === "emailing") {
      setDailyProgress((prev) => {
        const updated = { ...prev, email: true };
        writeDailyProgress(updated);
        return updated;
      });
    }

    go(target.path);
  }

  function toggleProgressItem(key: keyof DailyProgress) {
    setDailyProgress((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  function markContentCreated() {
    const updated: DailyProgress = {
      ...dailyProgress,
      content: true,
    };
    setDailyProgress(updated);
    writeDailyProgress(updated);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="px-6 pt-[120px] pb-16">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="max-w-6xl mx-auto text-center"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-yellow-400">
            Centre de contrôle LGD
          </h1>
          <p className="mt-2 text-white/70">{heroTitle}</p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Pill>
              <FaBolt className="text-yellow-300" />
              Affiliation accessible à vie
            </Pill>
            <Pill>
              <FaCrown className="text-yellow-300" />
              Modules activés selon ton plan
            </Pill>
            <Pill>
              <FaRobot className="text-yellow-300" />
              Objectif : 1ère vente → scaler
            </Pill>
          </div>

          {isLoggedIn ? (
            <div className="mt-6 text-[14px] text-white/80">
              {loadingPlan ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
                  Vérification du plan…
                </span>
              ) : (
                <span>
                  Plan actuel :{" "}
                  <span className="text-yellow-200 font-semibold">
                    {planLabel(plan)}
                  </span>
                </span>
              )}
            </div>
          ) : null}
        </motion.div>

        {isLoggedIn ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.32 }}
            className="mx-auto mt-10 w-full max-w-[1200px] px-4"
          >
            <div className="w-full rounded-[32px] border border-yellow-600/25 bg-gradient-to-br from-[#101010] via-[#090909] to-[#15110a] px-6 py-8 shadow-[0_0_70px_rgba(255,184,0,0.10)] sm:px-10 sm:py-10">
              <div className="mx-auto w-full max-w-none">
                <div className="flex flex-col items-center text-center">
                  <div className="inline-flex items-center gap-2 rounded-full border border-yellow-600/25 bg-[#0b0b0b] px-4 py-1 text-[12px] text-white/75">
                    <FaBolt className="text-yellow-300" />
                    Mode CMO IA
                  </div>

                  <h2 className="mt-4 text-2xl sm:text-4xl font-extrabold text-[#ffb800]">
                    Ton CMO IA a pris une décision pour toi
                  </h2>

                  <p className="mt-3 max-w-4xl text-white/75 text-sm sm:text-base">
                    LGD analyse ton objectif du jour, choisit l’action la plus rentable et transforme ton dashboard
                    en centre de décision business.
                  </p>
                </div>

                <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-[1.35fr_0.75fr]">
                  <div className="rounded-3xl border border-yellow-600/20 bg-black/35 p-5 text-left shadow-[0_0_30px_rgba(255,184,0,0.06)]">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300">
                          🎯 Action prioritaire recommandée
                        </p>
                        <p className="mt-3 text-xl font-extrabold leading-snug text-white">
                          {cmoResult?.priority_action || "Lancer Coach Alex pour clarifier ton action la plus rentable."}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={loadCmoLive}
                        disabled={cmoLoading}
                        className="shrink-0 rounded-2xl border border-yellow-400/30 px-4 py-2 text-sm font-semibold text-yellow-200 transition hover:bg-yellow-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {cmoLoading ? "Analyse CMO..." : "Actualiser CMO IA"}
                      </button>
                    </div>

                    {cmoResult?.diagnostic ? (
                      <p className="mt-5 text-sm leading-7 text-white/72">
                        {cmoResult.diagnostic}
                      </p>
                    ) : (
                      <p className="mt-5 text-sm leading-7 text-white/60">
                        Clique sur “Actualiser CMO IA” pour générer une décision stratégique live depuis le backend V5.
                      </p>
                    )}

                    {cmoResult?.why_this_action ? (
                      <div className="mt-5 rounded-2xl border border-yellow-600/15 bg-[#0b0b0b] px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-white/45">Pourquoi cette action</p>
                        <p className="mt-2 text-sm leading-6 text-white/70">{cmoResult.why_this_action}</p>
                      </div>
                    ) : null}

                    {cmoError ? (
                      <p className="mt-4 text-sm text-red-300">{cmoError}</p>
                    ) : null}
                  </div>

                  <div className="rounded-3xl border border-yellow-600/20 bg-[#0b0b0b]/80 p-5 text-left">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300">
                      ⚡ Exécution rapide
                    </p>

                    {cmoResult?.next_best_action ? (
                      <div className="mt-4 rounded-2xl border border-yellow-600/15 bg-black/35 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-white/45">Prochaine meilleure action</p>
                        <p className="mt-2 text-sm font-semibold leading-6 text-yellow-100">{cmoResult.next_best_action}</p>
                      </div>
                    ) : (
                      <p className="mt-4 text-sm leading-7 text-white/60">
                        Génère une décision CMO pour obtenir la prochaine action exacte à exécuter.
                      </p>
                    )}

                    <div className="mt-5 grid grid-cols-1 gap-3">
                      <PrimaryButton onClick={executeCmoModuleAuto}>
                        {cmoModuleTarget.label}
                      </PrimaryButton>
                      <SecondaryButton onClick={loadCmoLive}>
                        Générer une décision CMO
                      </SecondaryButton>
                    </div>

                    <p className="mt-3 text-center text-xs leading-5 text-white/45">
                      Le CMO prépare le contexte puis ouvre automatiquement le module le plus adapté.
                    </p>

                    {cmoResult?.generated_content?.cta ? (
                      <div className="mt-5 rounded-2xl border border-yellow-600/15 bg-black/35 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-white/45">CTA conseillé</p>
                        <p className="mt-2 text-sm font-semibold text-yellow-100">{cmoResult.generated_content.cta}</p>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-7 w-full border-t border-yellow-600/15 pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-yellow-600/25 bg-[#0b0b0b] px-4 py-1 text-[12px] text-white/75">
                      <FaRobot className="text-yellow-300" />
                      Progression du jour
                    </div>

                    <p className="mt-3 max-w-3xl text-white/70 text-sm">
                      Clique sur une étape pour la cocher ou la décocher. Ta progression reste enregistrée
                      même si tu recharges la page.
                    </p>

                    <div className="mt-5 grid w-full max-w-4xl grid-cols-1 md:grid-cols-2 gap-4">
                      <ProgressItem done={dailyProgress.idea} label="Idée trouvée" onClick={() => toggleProgressItem("idea")} />
                      <ProgressItem done={dailyProgress.content} label="Contenu créé" onClick={() => toggleProgressItem("content")} />
                      <ProgressItem done={dailyProgress.email} label="Email généré" onClick={() => toggleProgressItem("email")} />
                      <ProgressItem done={dailyProgress.offer} label="Offre envoyée" onClick={() => toggleProgressItem("offer")} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.32 }}
            className="max-w-6xl mx-auto mt-10"
          >
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-stretch">
              <CardLuxe className="h-full px-6 py-7 sm:px-8 sm:py-8">
                <div className="flex h-full flex-col items-center text-center">
                  <div className="inline-flex items-center gap-2 rounded-full border border-yellow-600/25 bg-[#0b0b0b] px-4 py-1 text-[12px] text-white/75">
                    <FaBolt className="text-yellow-300" />
                    Action prioritaire du jour
                  </div>

                  <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-[#ffb800]">
                    Ton plan du jour est prêt
                  </h2>

                  <p className="mt-3 max-w-xl text-white/75 text-sm sm:text-base">
                    Lance Coach AlexIA et exécute ton action la plus rentable aujourd’hui.
                    LGD te guide pour passer plus vite de l’idée à l’action, puis de l’action à la vente.
                  </p>

                  <div className="mt-6 w-full max-w-md">
                    <PrimaryButton onClick={() => accessOrExplain("coach")}>
                      Lancer Coach AlexIA
                    </PrimaryButton>
                  </div>

                  <div className="mt-7 w-full border-t border-yellow-600/15 pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="inline-flex items-center gap-2 rounded-full border border-yellow-600/25 bg-[#0b0b0b] px-4 py-1 text-[12px] text-white/75">
                        <FaRobot className="text-yellow-300" />
                        Progression du jour
                      </div>

                      <p className="mt-3 max-w-xl text-white/70 text-sm">
                        Clique sur une étape pour la cocher ou la décocher. Ta progression reste enregistrée
                        même si tu recharges la page.
                      </p>

                      <div className="mt-5 grid w-full grid-cols-1 sm:grid-cols-2 gap-4">
                        <ProgressItem done={dailyProgress.idea} label="Idée trouvée" onClick={() => toggleProgressItem("idea")} />
                        <ProgressItem done={dailyProgress.content} label="Contenu créé" onClick={() => toggleProgressItem("content")} />
                        <ProgressItem done={dailyProgress.email} label="Email généré" onClick={() => toggleProgressItem("email")} />
                        <ProgressItem done={dailyProgress.offer} label="Offre envoyée" onClick={() => toggleProgressItem("offer")} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardLuxe>

              <CardLuxe className="h-full px-6 py-7 sm:px-8 sm:py-8">
                <div className="flex h-full flex-col">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ffb800]">
                    Essai gratuit 7 jours 🚀
                  </h2>

                  <p className="mt-4 text-sm leading-7 text-white/80 sm:text-base">
                    Découvre LGD gratuitement pendant 7 jours, sans carte bancaire. Teste les fonctionnalités clés
                    et lance ton business avec l’IA.
                  </p>

                  <div className="mt-6 space-y-3 text-sm font-semibold text-white/90">
                    <div>🗓️ 7 jours gratuits</div>
                    <div>💳 Sans carte bancaire</div>
                    <div>🎫 10 000 jetons IA / jour</div>
                    <div>🧠 Mémoire LGD activée</div>
                    <div>⏱️ Reprise du compte à tout moment</div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-yellow-600/20 bg-yellow-500/10 p-4 text-sm leading-6 text-white/85">
                    💛 À la fin de ton essai, ton travail reste sauvegardé. Tu peux revenir à tout moment
                    et activer ton plan Essentielle, Pro ou Ultime.
                  </div>

                  <div className="mt-auto pt-8">
                    <button
                      type="button"
                      onClick={goToTrial}
                      className="w-full rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 px-5 py-4 font-extrabold text-white shadow-[0_0_35px_rgba(255,184,0,0.22)] transition-all hover:-translate-y-0.5 hover:brightness-110"
                    >
                      Activer mon essai gratuit 🚀
                    </button>
                  </div>
                </div>
              </CardLuxe>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="max-w-6xl mx-auto mt-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CardLuxe className="min-h-[230px] flex flex-col items-center justify-between px-6 py-6 text-center">
              <div className="flex flex-col items-center">
                <FaUserAstronaut className={iconGlow} />
                <h3 className="mt-3 text-xl font-bold text-[#ffb800]">
                  Coach Alex V2
                </h3>
                <p className="mt-2 text-white/70 max-w-[420px]">
                  Ton plan d’action quotidien pour générer ta première vente puis scaler. L’IA te guide, tu exécutes.
                </p>
                {!hasPaidAccess ? <div className="mt-3"><LockBadge /></div> : null}
              </div>

              <div className="w-full mt-6">
                <SecondaryButton onClick={() => accessOrExplain("coach")}>
                  {hasPaidAccess ? "Accéder" : "Découvrir"}
                </SecondaryButton>
              </div>
            </CardLuxe>

            <CardLuxe className="min-h-[230px] flex flex-col items-center justify-between px-6 py-6 text-center">
              <div className="flex flex-col items-center">
                <FaRobot className={iconGlow} />
                <h3 className="mt-3 text-xl font-bold text-[#ffb800]">
                  Éditeur Intelligent
                </h3>
                <p className="mt-2 text-white/70 max-w-[420px]">
                  Transforme une idée en contenu qui attire, engage et vend. Post + Carrousel optimisés conversion.
                </p>
                {!hasPaidAccess ? <div className="mt-3"><LockBadge /></div> : null}
              </div>

              <div className="w-full mt-6">
                <SecondaryButton
                  onClick={() => accessOrExplain("editor")}
                >
                  {hasPaidAccess ? "Accéder" : "Découvrir"}
                </SecondaryButton>
              </div>
            </CardLuxe>

            <CardLuxe className="min-h-[230px] flex flex-col items-center justify-between px-6 py-6 text-center">
              <div className="flex flex-col items-center">
                <FaEnvelope className={iconGlow} />
                <h3 className="mt-3 text-xl font-bold text-[#ffb800]">
                  Campagnes E-mailing IA
                </h3>
                <p className="mt-2 text-white/70 max-w-[420px]">
                  Transforme ton audience en prospects puis en clients avec des séquences email prêtes à vendre.
                </p>
                {!hasPaidAccess ? (
                  <div className="mt-3">
                    <LockBadge />
                  </div>
                ) : null}
              </div>

              <div className="w-full mt-6">
                <SecondaryButton onClick={() => accessOrExplain("emailing")}>
                  {hasPaidAccess ? "Accéder" : "Découvrir"}
                </SecondaryButton>
              </div>
            </CardLuxe>

            <LeadEngineBlock onDiscover={() => (hasPaidAccess ? go("/dashboard/lead-engine") : openModal("lead_engine"))} />
          </div>
        </motion.div>

      </div>

      <ModalShell
        open={activeModal === "editor"}
        title="Éditeur Intelligent — Post + Carrousel V5"
        subtitle="Crée vite, propre, et vend. IA + design premium LGD."
        icon={<FaRobot />}
        onClose={closeModal}
      >
        <div className="grid gap-4">
          <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 text-white/80">
            <div className="text-yellow-200 font-semibold">Ce que tu obtiens</div>
            <ul className="mt-2 space-y-2 text-sm">
              <li>• Templates + mise en page premium (sans perdre du temps)</li>
              <li>• Copilote IA pour accélérer la création et améliorer la conversion</li>
              <li>• Carrousel + Post, prêt à publier (workflow ultra rapide)</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 text-white/80">
            <div className="text-yellow-200 font-semibold">Pourquoi c’est rentable</div>
            <p className="mt-2 text-sm text-white/70">
              Tu produis plus, plus vite, avec une meilleure qualité → plus de constance → plus
              de prospects → plus de ventes.
            </p>
          </div>

          {hasPaidAccess ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PrimaryButton
                onClick={() => {
                  closeModal();
                  markContentCreated();
                  go("/dashboard/automatisations/reseaux_sociaux/editor-intelligent");
                }}
              >
                Accéder maintenant
              </PrimaryButton>
              {plan !== "ultime" ? (
                <SecondaryButton onClick={openSystemeioPlans}>Upgrade</SecondaryButton>
              ) : (
                <SecondaryButton onClick={closeModal}>Fermer</SecondaryButton>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PrimaryButton onClick={goToTrial}>Essai gratuit 7 jours</PrimaryButton>
              <SecondaryButton onClick={goToLogin}>Se connecter</SecondaryButton>
            </div>
          )}
        </div>
      </ModalShell>

      <ModalShell
        open={activeModal === "coach"}
        title="Coach Alex V2"
        subtitle="1ère vente → scaler. Mission claire, exécution rapide."
        icon={<FaUserAstronaut />}
        onClose={closeModal}
      >
        <div className="grid gap-4">
          <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 text-white/80">
            <div className="text-yellow-200 font-semibold">Ce que tu obtiens</div>
            <ul className="mt-2 space-y-2 text-sm">
              <li>• Mission du jour orientée vente (pas de blabla)</li>
              <li>• Parcours guidé : setup → action → feedback → optimisation</li>
              <li>• IA + quotas synchronisés (pilotage propre)</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 text-white/80">
            <div className="text-yellow-200 font-semibold">Pourquoi c’est rentable</div>
            <p className="mt-2 text-sm text-white/70">
              Tu exécutes chaque jour l’action qui augmente ta probabilité de vente.
              Résultat : momentum → cash → scale.
            </p>
          </div>

          {hasPaidAccess ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PrimaryButton
                onClick={() => {
                  closeModal();
                  go("/dashboard/coach-ia");
                }}
              >
                Accéder maintenant
              </PrimaryButton>
              {plan !== "ultime" ? (
                <SecondaryButton onClick={openSystemeioPlans}>Upgrade</SecondaryButton>
              ) : (
                <SecondaryButton onClick={closeModal}>Fermer</SecondaryButton>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PrimaryButton onClick={goToTrial}>Essai gratuit 7 jours</PrimaryButton>
              <SecondaryButton onClick={goToLogin}>Se connecter</SecondaryButton>
            </div>
          )}
        </div>
      </ModalShell>

      <ModalShell
        open={activeModal === "emailing"}
        title="Campagnes E-mailing IA"
        subtitle="Séquences prêtes à vendre — bientôt dans LGD."
        icon={<FaEnvelope />}
        onClose={closeModal}
      >
        <div className="grid gap-4">
          <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 text-white/80">
            <div className="text-yellow-200 font-semibold">Ce que tu obtiens</div>
            <ul className="mt-2 space-y-2 text-sm">
              <li>• Séquences 7 / 14 / 30 jours générées avec angle business</li>
              <li>• Relances, objections, CTA et structure orientée conversion</li>
              <li>• Campagnes prêtes à envoyer pour vendre, relancer et fidéliser</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 text-white/80">
            <div className="text-yellow-200 font-semibold">Pourquoi c’est rentable</div>
            <p className="mt-2 text-sm text-white/70">
              L’email reste l’un des canaux les plus rentables : plus de suivi, plus de relances,
              plus de ventes avec moins de friction.
            </p>
          </div>

          {hasPaidAccess ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PrimaryButton
                onClick={() => {
                  closeModal();
                  go("/dashboard/email-campaigns");
                }}
              >
                Accéder maintenant
              </PrimaryButton>
              {plan !== "ultime" ? (
                <SecondaryButton onClick={openSystemeioPlans}>Upgrade</SecondaryButton>
              ) : (
                <SecondaryButton onClick={closeModal}>Fermer</SecondaryButton>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PrimaryButton onClick={goToTrial}>Essai gratuit 7 jours</PrimaryButton>
              <SecondaryButton onClick={goToLogin}>Se connecter</SecondaryButton>
            </div>
          )}
        </div>
      </ModalShell>

      <ModalShell
        open={activeModal === "lead_engine"}
        title="Lead Engine IA"
        subtitle="Transforme ton contenu en machine à capturer des emails."
        icon={<FaEnvelope />}
        onClose={closeModal}
      >
        <div className="grid gap-4">
          <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 text-white/80">
            <div className="text-yellow-200 font-semibold">Ce que LGD va générer</div>
            <ul className="mt-2 space-y-2 text-sm">
              <li>• Un lead magnet orienté conversion (checklist, mini-guide, template, ebook)</li>
              <li>• Une page de capture premium prête à collecter des emails</li>
              <li>• Des CTA optimisés à injecter dans tes posts, carrousels et contenus</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 text-white/80">
            <div className="text-yellow-200 font-semibold">Pourquoi c’est stratégique</div>
            <p className="mt-2 text-sm text-white/70">
              Les followers peuvent disparaître. Une liste email reste ton actif.
              Lead Engine a été pensé pour transformer ton audience en base email durable, exploitable et rentable.
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 text-white/80">
            <div className="text-yellow-200 font-semibold">Bientôt dans LGD</div>
            <p className="mt-2 text-sm text-white/70">
              Génération d’aimant à prospects, page de capture, angle de promesse, CTA, puis connexion logique avec l’emailing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <PrimaryButton
                onClick={() => {
                  if (hasPaidAccess) {
                    window.location.href = "/dashboard/lead-engine";
                    return;
                  }
                  goToTrial();
                }}
              >
                {hasPaidAccess ? "Créer mon Lead Engine" : "Essai gratuit 7 jours"}
              </PrimaryButton>
              <p className="mt-2 text-center text-xs text-white/50">
                Génère ton premier aimant à prospects en quelques clics
              </p>
            </div>
            <SecondaryButton onClick={closeModal}>Fermer</SecondaryButton>
          </div>
        </div>
      </ModalShell>

      <ModalShell
        open={activeModal === "ebook"}
        title="Ebook Viral 4.0 IA"
        subtitle="Lead magnet premium + low ticket — bientôt."
        icon={<FaBook />}
        onClose={closeModal}
      >
        <div className="grid gap-4">
          <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 text-sm text-white/75">
            <div className="text-yellow-200 font-semibold">Ce que ça va débloquer</div>
            <p className="mt-2">
              Créer un ebook qui attire, convertit et peut être vendu (7–27€) ou offert
              comme aimant à prospects.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PrimaryButton onClick={closeModal}>OK</PrimaryButton>
            <SecondaryButton onClick={closeModal}>Fermer</SecondaryButton>
          </div>
        </div>
      </ModalShell>

      <ModalShell
        open={activeModal === "multiplier"}
        title="Content Multiplier IA"
        subtitle="1 contenu → 20 formats — bientôt."
        icon={<FaSyncAlt />}
        onClose={closeModal}
      >
        <div className="grid gap-4">
          <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 text-sm text-white/75">
            <div className="text-yellow-200 font-semibold">Pourquoi ça cartonne</div>
            <p className="mt-2">
              Les US utilisent le repurposing massif : un angle devient carrousel + email +
              post + reel + thread. Visibilité x10.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PrimaryButton onClick={closeModal}>OK</PrimaryButton>
            <SecondaryButton onClick={closeModal}>Fermer</SecondaryButton>
          </div>
        </div>
      </ModalShell>

      <ModalShell
        open={activeModal === "offer"}
        title="Créateur d’Offre Magnétique"
        subtitle="Offre claire = ventes rapides — bientôt."
        icon={<FaGem />}
        onClose={closeModal}
      >
        <div className="grid gap-4">
          <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 text-sm text-white/75">
            <div className="text-yellow-200 font-semibold">Objectif</div>
            <p className="mt-2">
              Transformer “je sais faire X” en offre vendable : promesse, preuve, bonus,
              prix, angle de vente.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PrimaryButton onClick={closeModal}>OK</PrimaryButton>
            <SecondaryButton onClick={closeModal}>Fermer</SecondaryButton>
          </div>
        </div>
      </ModalShell>

      <ModalShell
        open={activeModal === "funnel"}
        title="Funnel Express IA"
        subtitle="Capture → vente → relance — bientôt."
        icon={<FaFilter />}
        onClose={closeModal}
      >
        <div className="grid gap-4">
          <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 text-sm text-white/75">
            <div className="text-yellow-200 font-semibold">Ce que ça apporte</div>
            <p className="mt-2">
              Un mini tunnel simple (pas un clone de systeme.io) : structure, copy, emails
              de relance, checklist d’exécution.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PrimaryButton onClick={closeModal}>OK</PrimaryButton>
            <SecondaryButton onClick={closeModal}>Fermer</SecondaryButton>
          </div>
        </div>
      </ModalShell>
    </div>
  );
}
