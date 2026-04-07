"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Plan = "none" | "essentiel" | "pro" | "ultime";

const PLANS_URL = process.env.NEXT_PUBLIC_SYSTEMEIO_PLANS_URL ?? "https://legenerateurdigital.systeme.io/lgd";
const DASHBOARD_PATH = "/dashboard";
const AFFILIATION_PATH = "/dashboard/affiliation";
const EDITOR_PATH = "/dashboard/automatisations/reseaux_sociaux/editor-intelligent";
const COACH_PATH = "/dashboard/coach-ia";
const PLANNER_PATH = "/dashboard/automatisations/reseaux_sociaux/planner";
const EMAIL_CAMPAIGNS_PATH = "/dashboard/email-campaigns";

function planLabel(plan: Plan) {
  if (plan === "ultime") return "ULTIME";
  if (plan === "pro") return "PRO";
  if (plan === "essentiel") return "ESSENTIEL";
  return "AUCUN";
}

function normalizePlan(input: any): Plan {
  const v = String(input || "").toLowerCase().trim();
  if (v === "ultime") return "ultime";
  if (v === "pro") return "pro";
  if (v === "essentiel") return "essentiel";
  return "none";
}

function getPlanFromLocalStorage(): Plan {
  if (typeof window === "undefined") return "none";
  if (window.localStorage.getItem("lgd_plan_ultime") === "active") return "ultime";
  if (window.localStorage.getItem("lgd_plan_pro") === "active") return "pro";
  if (window.localStorage.getItem("lgd_plan_essentiel") === "active") return "essentiel";
  return "none";
}

function isActive(pathname: string, path: string) {
  if (path === DASHBOARD_PATH) return pathname === DASHBOARD_PATH;
  return pathname === path || pathname.startsWith(`${path}/`);
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [plan, setPlan] = useState<Plan>("none");
  const [loadingPlan, setLoadingPlan] = useState(true);

  useEffect(() => {
    let alive = true;
    const fallbackPlan = getPlanFromLocalStorage();

    if (fallbackPlan !== "none") {
      setPlan(fallbackPlan);
      setLoadingPlan(false);
      return () => {
        alive = false;
      };
    }

    async function loadPlan() {
      try {
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");
        const res = await fetch(`${apiUrl}/ai-quota/global`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (!res.ok) {
          if (alive) setPlan("none");
          return;
        }

        const data = await res.json();
        const p = normalizePlan(data?.plan ?? data?.current_plan ?? data?.subscription_plan ?? data?.user_plan);
        if (alive) setPlan(p);
      } catch {
        if (alive) setPlan("none");
      } finally {
        if (alive) setLoadingPlan(false);
      }
    }

    loadPlan();
    return () => {
      alive = false;
    };
  }, []);

  const hasPaidAccess = useMemo(() => plan !== "none", [plan]);
  const linkClasses = (path: string) =>
    `px-4 py-2 rounded-xl transition-colors ${isActive(pathname, path) ? "bg-yellow-500 text-black font-semibold" : "text-white/80 hover:text-yellow-400"}`;

  const badgeClasses =
    plan === "ultime"
      ? "px-3 py-1 rounded-full text-[11px] font-semibold bg-yellow-500 text-black"
      : plan === "pro"
      ? "px-3 py-1 rounded-full text-[11px] font-semibold border border-yellow-500/60 text-yellow-200 bg-[#0b0b0b]"
      : plan === "essentiel"
      ? "px-3 py-1 rounded-full text-[11px] font-semibold border border-yellow-600/30 text-yellow-200 bg-[#0b0b0b]"
      : "px-3 py-1 rounded-full text-[11px] font-semibold border border-yellow-600/20 text-white/60 bg-[#0b0b0b]";

  const drawerBtn = "w-full inline-flex items-center justify-between px-4 py-4 rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] text-white/90 hover:bg-[#111111] transition-all";
  const drawerBtnActive = "w-full inline-flex items-center justify-between px-4 py-4 rounded-2xl border border-yellow-500 bg-[#111111] text-yellow-200";
  const drawerBtnLocked = "w-full inline-flex items-center justify-between px-4 py-4 rounded-2xl border border-yellow-600/15 bg-[#0b0b0b] text-white/35 cursor-not-allowed select-none";

  function go(path: string) {
    setMenuOpen(false);
    router.push(path);
  }

  function openPlans(e?: React.MouseEvent) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setMenuOpen(false);
    window.open(PLANS_URL, "_blank", "noopener,noreferrer");
  }

  function lockedToPlans(e: React.MouseEvent) {
    openPlans(e);
  }

  return (
    <header className="fixed top-0 left-0 w-full z-50 border-b border-yellow-600/20 bg-[#0b0b0b]/95 backdrop-blur-md shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-5 py-4">
        <Link href={DASHBOARD_PATH} className="text-lg sm:text-xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-300 bg-clip-text text-transparent">
          Le Générateur Digital
        </Link>

        <nav className="hidden md:flex items-center gap-3">
          <Link href={DASHBOARD_PATH} className={linkClasses(DASHBOARD_PATH)}>Dashboard</Link>
          <Link href={AFFILIATION_PATH} className={linkClasses(AFFILIATION_PATH)}>Affiliation</Link>
          {hasPaidAccess ? (
            <>
              <Link href={EDITOR_PATH} className={linkClasses(EDITOR_PATH)}>Éditeur</Link>
              <Link href={PLANNER_PATH} className={linkClasses(PLANNER_PATH)}>Planner</Link>
              <Link href={COACH_PATH} className={linkClasses(COACH_PATH)}>Coach</Link>
              <Link href={EMAIL_CAMPAIGNS_PATH} className={linkClasses(EMAIL_CAMPAIGNS_PATH)}>Emailing IA</Link>
            </>
          ) : (
            <>
              <a href={PLANS_URL} className="px-4 py-2 rounded-xl border border-yellow-600/20 text-white/35 hover:bg-[#111111] transition-all" onClick={lockedToPlans}>Éditeur 🔒</a>
              <a href={PLANS_URL} className="px-4 py-2 rounded-xl border border-yellow-600/20 text-white/35 hover:bg-[#111111] transition-all" onClick={lockedToPlans}>Planner 🔒</a>
              <a href={PLANS_URL} className="px-4 py-2 rounded-xl border border-yellow-600/20 text-white/35 hover:bg-[#111111] transition-all" onClick={lockedToPlans}>Coach 🔒</a>
              <a href={PLANS_URL} className="px-4 py-2 rounded-xl border border-yellow-600/20 text-white/35 hover:bg-[#111111] transition-all" onClick={lockedToPlans}>Emailing IA 🔒</a>
            </>
          )}
          <a href={PLANS_URL} className="px-4 py-2 rounded-xl text-white/80 hover:text-yellow-400 transition-colors" onClick={openPlans}>Plans</a>
          <span className={badgeClasses}>{loadingPlan ? "PLAN : ..." : `PLAN : ${planLabel(plan)}`}</span>
          {plan !== "ultime" && <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ffb800] to-[#ffcc4d] text-black font-semibold hover:-translate-y-0.5 transition-all" onClick={openPlans}>Upgrade</button>}
        </nav>

        <div className="md:hidden flex items-center gap-3">
          <span className={badgeClasses}>{loadingPlan ? "PLAN : ..." : `PLAN : ${planLabel(plan)}`}</span>
          <button className="text-yellow-400 text-2xl px-2 py-1 rounded-xl hover:bg-[#111111] transition-all" onClick={() => setMenuOpen(true)} aria-label="Ouvrir le menu">☰</button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div className="fixed inset-0 z-[80]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/70" onClick={() => setMenuOpen(false)} />
            <motion.div initial={{ y: -20, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -20, opacity: 0, scale: 0.98 }} transition={{ duration: 0.18 }} className="absolute top-0 left-0 right-0 bg-[#0b0b0b]/98 backdrop-blur-md border-b border-yellow-600/20">
              <div className="px-5 pt-5 pb-6">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold bg-gradient-to-r from-yellow-500 to-yellow-300 bg-clip-text text-transparent">Menu LGD</div>
                  <button onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded-xl border border-yellow-600/25 text-yellow-200 hover:bg-[#111111] transition-all" aria-label="Fermer le menu">✕</button>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className={badgeClasses}>{loadingPlan ? "PLAN : ..." : `PLAN : ${planLabel(plan)}`}</span>
                  {plan !== "ultime" && <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ffb800] to-[#ffcc4d] text-black font-semibold" onClick={openPlans}>Upgrade</button>}
                </div>
                <div className="mt-6 grid grid-cols-1 gap-3">
                  <button className={isActive(pathname, DASHBOARD_PATH) ? drawerBtnActive : drawerBtn} onClick={() => go(DASHBOARD_PATH)}><span>Dashboard</span><span className="text-white/40">→</span></button>
                  <button className={isActive(pathname, AFFILIATION_PATH) ? drawerBtnActive : drawerBtn} onClick={() => go(AFFILIATION_PATH)}><span>Affiliation</span><span className="text-white/40">→</span></button>
                  {hasPaidAccess ? (
                    <>
                      <button className={isActive(pathname, EDITOR_PATH) ? drawerBtnActive : drawerBtn} onClick={() => go(EDITOR_PATH)}><span>Éditeur</span><span className="text-white/40">→</span></button>
                      <button className={isActive(pathname, PLANNER_PATH) ? drawerBtnActive : drawerBtn} onClick={() => go(PLANNER_PATH)}><span>Planner</span><span className="text-white/40">→</span></button>
                      <button className={isActive(pathname, COACH_PATH) ? drawerBtnActive : drawerBtn} onClick={() => go(COACH_PATH)}><span>Coach</span><span className="text-white/40">→</span></button>
                      <button className={isActive(pathname, EMAIL_CAMPAIGNS_PATH) ? drawerBtnActive : drawerBtn} onClick={() => go(EMAIL_CAMPAIGNS_PATH)}><span>Emailing IA</span><span className="text-white/40">→</span></button>
                    </>
                  ) : (
                    <>
                      <a href={PLANS_URL} className={drawerBtnLocked} onClick={lockedToPlans}><span>Éditeur</span><span>🔒</span></a>
                      <a href={PLANS_URL} className={drawerBtnLocked} onClick={lockedToPlans}><span>Planner</span><span>🔒</span></a>
                      <a href={PLANS_URL} className={drawerBtnLocked} onClick={lockedToPlans}><span>Coach</span><span>🔒</span></a>
                      <a href={PLANS_URL} className={drawerBtnLocked} onClick={lockedToPlans}><span>Emailing IA</span><span>🔒</span></a>
                    </>
                  )}
                  <a href={PLANS_URL} className={drawerBtn} onClick={openPlans}><span>Plans</span><span className="text-white/40">→</span></a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
