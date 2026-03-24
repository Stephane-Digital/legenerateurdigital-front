"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import CardLuxe from "@/components/ui/CardLuxe";

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

type Plan = "none" | "essentiel" | "pro" | "ultime";

type ModalKey =
  | "editor"
  | "coach"
  | "affiliation"
  | "emailing"
  | "ebook"
  | "multiplier"
  | "offer"
  | "funnel";

type DailyProgress = {
  idea: boolean;
  content: boolean;
  email: boolean;
  offer: boolean;
};

const SYSTEMEIO_PLANS_URL =
  process.env.NEXT_PUBLIC_SYSTEMEIO_PLANS_URL || "https://legenerateurdigital.systeme.io/planslgd";

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
  return "AUCUN";
}

async function fetchPlanFromBackend(): Promise<Plan> {
  const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");
  const url = `${base}/ai-quota/global`;

  const token = typeof window !== "undefined" ? window.localStorage.getItem("lgd_token") : null;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`ai-quota/global ${res.status}`);

  const data = (await res.json()) as any;
  const p = String(data?.plan || "").toLowerCase();

  if (p.includes("ultime")) return "ultime";
  if (p.includes("pro")) return "pro";
  if (p.includes("essentiel")) return "essentiel";
  return "none";
}

function getPlanFromLocalStorage(): Plan {
  if (typeof window === "undefined") return "none";
  const essentiel = localStorage.getItem("lgd_plan_essentiel");
  const pro = localStorage.getItem("lgd_plan_pro");
  const ultime = localStorage.getItem("lgd_plan_ultime");

  if (ultime === "active") return "ultime";
  if (pro === "active") return "pro";
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

function openSystemeioPlans() {
  window.open(SYSTEMEIO_PLANS_URL, "_blank", "noopener,noreferrer");
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
      Accès selon plan
    </span>
  );
}

function SoonBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-yellow-600/25 bg-[#0b0b0b] px-3 py-1 text-[12px] text-white/60">
      <FaBolt className="text-yellow-300" />
      Bientôt disponible
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

  const [plan, setPlan] = useState<Plan>("none");
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalKey | null>(null);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>(DEFAULT_PROGRESS);

  useEffect(() => {
    let cancelled = false;

    async function load() {
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
    setDailyProgress(readDailyProgress());
  }, []);

  useEffect(() => {
    writeDailyProgress(dailyProgress);
  }, [dailyProgress]);

  const hasPaidAccess = useMemo(() => plan !== "none", [plan]);

  const heroTitle =
    "Crée du contenu • Attire des prospects • Génère tes premières ventes avec l’IA";

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

  function accessOrExplain(key: "editor" | "coach" | "emailing") {
    openModal(key);
  }

  function toggleProgressItem(key: keyof DailyProgress) {
    setDailyProgress((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.32 }}
          className="max-w-6xl mx-auto mt-10"
        >
          <CardLuxe className="px-6 py-7 sm:px-8 sm:py-8">
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-600/25 bg-[#0b0b0b] px-4 py-1 text-[12px] text-white/75">
                <FaBolt className="text-yellow-300" />
                Action prioritaire du jour
              </div>

              <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-[#ffb800]">
                Ton plan du jour est prêt
              </h2>

              <p className="mt-3 max-w-3xl text-white/75 text-sm sm:text-base">
                Lance Coach Alex et exécute ton action la plus rentable aujourd’hui.
                LGD te guide pour passer plus vite de l’idée à l’action, puis de l’action à la vente.
              </p>

              <div className="mt-6 w-full max-w-md">
                <PrimaryButton
                  onClick={() => {
                    if (hasPaidAccess) {
                      go("/dashboard/coach-ia");
                      return;
                    }
                    openSystemeioPlans();
                  }}
                >
                  {hasPaidAccess ? "Démarrer maintenant" : "Voir les plans"}
                </PrimaryButton>
              </div>

              <div className="mt-7 w-full max-w-4xl border-t border-yellow-600/15 pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="inline-flex items-center gap-2 rounded-full border border-yellow-600/25 bg-[#0b0b0b] px-4 py-1 text-[12px] text-white/75">
                    <FaRobot className="text-yellow-300" />
                    Progression du jour
                  </div>

                  <p className="mt-3 max-w-3xl text-white/70 text-sm">
                    Clique sur une étape pour la cocher ou la décocher. Ta progression reste enregistrée
                    même si tu recharges la page.
                  </p>

                  <div className="mt-5 grid w-full grid-cols-1 md:grid-cols-2 gap-4">
                    <ProgressItem
                      done={dailyProgress.idea}
                      label="Idée trouvée"
                      onClick={() => toggleProgressItem("idea")}
                    />
                    <ProgressItem
                      done={dailyProgress.content}
                      label="Contenu créé"
                      onClick={() => toggleProgressItem("content")}
                    />
                    <ProgressItem
                      done={dailyProgress.email}
                      label="Email généré"
                      onClick={() => toggleProgressItem("email")}
                    />
                    <ProgressItem
                      done={dailyProgress.offer}
                      label="Offre envoyée"
                      onClick={() => toggleProgressItem("offer")}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardLuxe>
        </motion.div>

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
                <SecondaryButton onClick={() => accessOrExplain("editor")}>
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
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.14, duration: 0.3 }}
          className="max-w-6xl mx-auto mt-14"
        >
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-yellow-400">
              Modules IA avancés très prochainement
            </h2>
            <p className="mt-2 text-white/70">
              Visible dès maintenant / Bientôt disponible.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-7">
            <CardLuxe className="min-h-[210px] flex flex-col items-center justify-between px-6 py-6 text-center">
              <div className="flex flex-col items-center">
                <FaBook className={iconGlow} />
                <h3 className="mt-3 text-lg font-bold text-[#ffb800]">
                  Ebook Viral 4.0 IA
                </h3>
                <p className="mt-2 text-white/70">
                  Structure + chapitres + angle viral. Export prêt à vendre / lead magnet premium.
                </p>
                <div className="mt-3"><SoonBadge /></div>
              </div>
              <div className="w-full mt-6">
                <SecondaryButton onClick={() => openModal("ebook")}>
                  Découvrir
                </SecondaryButton>
              </div>
            </CardLuxe>

            <CardLuxe className="min-h-[210px] flex flex-col items-center justify-between px-6 py-6 text-center">
              <div className="flex flex-col items-center">
                <FaSyncAlt className={iconGlow} />
                <h3 className="mt-3 text-lg font-bold text-[#ffb800]">
                  Content Multiplier IA
                </h3>
                <p className="mt-2 text-white/70">
                  1 idée → 20 contenus (Reel, carrousel, email, X, LinkedIn). Distribution automatisée.
                </p>
                <div className="mt-3"><SoonBadge /></div>
              </div>
              <div className="w-full mt-6">
                <SecondaryButton onClick={() => openModal("multiplier")}>
                  Découvrir
                </SecondaryButton>
              </div>
            </CardLuxe>

            <CardLuxe className="min-h-[210px] flex flex-col items-center justify-between px-6 py-6 text-center">
              <div className="flex flex-col items-center">
                <FaGem className={iconGlow} />
                <h3 className="mt-3 text-lg font-bold text-[#ffb800]">
                  Créateur d’Offre Magnétique
                </h3>
                <p className="mt-2 text-white/70">
                  Positionnement, promesse, stack de bonus, preuve. Offre claire qui se vend vite.
                </p>
                <div className="mt-3"><SoonBadge /></div>
              </div>
              <div className="w-full mt-6">
                <SecondaryButton onClick={() => openModal("offer")}>
                  Découvrir
                </SecondaryButton>
              </div>
            </CardLuxe>

            <CardLuxe className="min-h-[210px] flex flex-col items-center justify-between px-6 py-6 text-center">
              <div className="flex flex-col items-center">
                <FaFilter className={iconGlow} />
                <h3 className="mt-3 text-lg font-bold text-[#ffb800]">
                  Funnel Express IA
                </h3>
                <p className="mt-2 text-white/70">
                  Mini tunnel : capture → vente → relance. Léger, rapide, orienté MRR/MLR.
                </p>
                <div className="mt-3"><SoonBadge /></div>
              </div>
              <div className="w-full mt-6">
                <SecondaryButton onClick={() => openModal("funnel")}>
                  Découvrir
                </SecondaryButton>
              </div>
            </CardLuxe>
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
              <PrimaryButton onClick={openSystemeioPlans}>Voir les plans</PrimaryButton>
              <SecondaryButton onClick={closeModal}>Fermer</SecondaryButton>
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
              <PrimaryButton onClick={openSystemeioPlans}>Voir les plans</PrimaryButton>
              <SecondaryButton onClick={closeModal}>Fermer</SecondaryButton>
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
              <PrimaryButton onClick={openSystemeioPlans}>Voir les plans</PrimaryButton>
              <SecondaryButton onClick={closeModal}>Fermer</SecondaryButton>
            </div>
          )}
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
