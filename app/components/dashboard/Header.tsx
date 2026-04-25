"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Plan = "none" | "azur" | "essentiel" | "pro" | "ultime";

const PLANS_URL = process.env.NEXT_PUBLIC_SYSTEMEIO_PLANS_URL ?? "https://legenerateurdigital.systeme.io/lgd";
const DASHBOARD_PATH = "/dashboard";
const AFFILIATION_PATH = "/dashboard/affiliation";
const EDITOR_PATH = "/dashboard/automatisations/reseaux_sociaux/editor-intelligent";
const COACH_PATH = "/dashboard/coach-ia";
const LEADS_PATH = "/dashboard/lead-engine";
const EMAIL_CAMPAIGNS_PATH = "/dashboard/email-campaigns";
const LOGIN_PATH = "/auth/login";

type NavItem = {
  label: string;
  path: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: DASHBOARD_PATH },
  { label: "Affiliation", path: AFFILIATION_PATH },
  { label: "Éditeur", path: EDITOR_PATH },
  { label: "Leads IA", path: LEADS_PATH },
  { label: "Coach", path: COACH_PATH },
  { label: "Emailing IA", path: EMAIL_CAMPAIGNS_PATH },
];

function planLabel(plan: Plan) {
  if (plan === "ultime") return "ULTIME";
  if (plan === "pro") return "PRO";
  if (plan === "essentiel") return "ESSENTIEL";
  if (plan === "azur") return "AZUR";
  return "VISITEUR";
}

function normalizePlan(input: any, tokensLimit?: any): Plan {
  const v = String(input || "").toLowerCase().trim();
  const limit = Number(tokensLimit || 0);

  if (v === "ultime") return "ultime";
  if (v === "pro") return "pro";
  if (v === "essentiel") {
    if (limit === 70000) return "azur";
    return "essentiel";
  }
  if (v === "trial" || v === "azur" || v === "starter" || v === "decouverte" || v === "découverte") return "azur";

  if (limit === 70000) return "azur";
  if (limit === 2500000) return "ultime";
  if (limit === 1000000) return "pro";
  if (limit === 400000) return "essentiel";

  return "none";
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

function getPlanFromLocalStorage(): Plan {
  if (typeof window === "undefined") return "none";
  if (window.localStorage.getItem("lgd_plan_ultime") === "active") return "ultime";
  if (window.localStorage.getItem("lgd_plan_pro") === "active") return "pro";
  if (window.localStorage.getItem("lgd_plan_essentiel") === "active") return "essentiel";
  if (
    window.localStorage.getItem("lgd_plan_starter") === "active" ||
    window.localStorage.getItem("lgd_plan_trial") === "active"
  ) {
    return "azur";
  }
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [plan, setPlan] = useState<Plan>("none");
  const [loadingPlan, setLoadingPlan] = useState(true);

  useEffect(() => {
    let alive = true;
    const token = getStoredToken();
    const hasToken = Boolean(token);

    setIsLoggedIn(hasToken);

    if (!hasToken) {
      setPlan("none");
      setLoadingPlan(false);
      return () => {
        alive = false;
      };
    }

    const fallbackPlan = getPlanFromLocalStorage();
    if (fallbackPlan !== "none") {
      setPlan(fallbackPlan);
      setLoadingPlan(false);
    }

    async function loadPlan() {
      try {
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");
        const res = await fetch(`${apiUrl}/ai-quota/global`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!res.ok) {
          if (alive && fallbackPlan === "none") setPlan("none");
          return;
        }

        const data = await res.json();
        const p = normalizePlan(
          data?.display_plan ?? data?.plan ?? data?.current_plan ?? data?.subscription_plan ?? data?.user_plan,
          data?.tokens_limit ?? data?.limit_tokens ?? data?.credits ?? data?.remaining
        );
        if (alive) setPlan(p);
      } catch {
        if (alive && fallbackPlan === "none") setPlan("none");
      } finally {
        if (alive) setLoadingPlan(false);
      }
    }

    loadPlan();
    return () => {
      alive = false;
    };
  }, []);

  const linkClasses = (path: string) =>
    `px-4 py-2 rounded-xl transition-colors ${isActive(pathname, path) ? "bg-yellow-500 text-black font-semibold" : "text-white/80 hover:text-yellow-400"}`;

  const badgeClasses =
    plan === "ultime"
      ? "px-3 py-1 rounded-full text-[11px] font-semibold bg-yellow-500 text-black"
      : plan === "pro"
      ? "px-3 py-1 rounded-full text-[11px] font-semibold border border-yellow-500/60 text-yellow-200 bg-[#0b0b0b]"
      : plan === "essentiel"
      ? "px-3 py-1 rounded-full text-[11px] font-semibold border border-yellow-600/30 text-yellow-200 bg-[#0b0b0b]"
      : plan === "azur"
      ? "px-3 py-1 rounded-full text-[11px] font-semibold border border-yellow-500/50 text-yellow-100 bg-[#0b0b0b]"
      : "px-3 py-1 rounded-full text-[11px] font-semibold border border-yellow-600/20 text-white/60 bg-[#0b0b0b]";

  const drawerBtn = "w-full inline-flex items-center justify-between px-4 py-4 rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] text-white/90 hover:bg-[#111111] transition-all";
  const drawerBtnActive = "w-full inline-flex items-center justify-between px-4 py-4 rounded-2xl border border-yellow-500 bg-[#111111] text-yellow-200";

  const showUpgrade = isLoggedIn && plan !== "ultime";

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

  function logout() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("access_token");
      window.localStorage.removeItem("lgd_token");
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("jwt");
      window.localStorage.removeItem("lgd_plan_ultime");
      window.localStorage.removeItem("lgd_plan_pro");
      window.localStorage.removeItem("lgd_plan_essentiel");
      window.localStorage.removeItem("lgd_plan_starter");
      window.localStorage.removeItem("lgd_plan_trial");
    }

    setPlan("none");
    setIsLoggedIn(false);
    setMenuOpen(false);
    router.push(DASHBOARD_PATH);
    router.refresh();
  }

  return (
    <header className="fixed top-0 left-0 w-full z-50 border-b border-yellow-600/20 bg-[#0b0b0b]/95 backdrop-blur-md shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-5 py-4">
        <Link href={DASHBOARD_PATH} className="text-lg sm:text-xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-300 bg-clip-text text-transparent">
          Le Générateur Digital
        </Link>

        <nav className="hidden md:flex items-center gap-3">
          {NAV_ITEMS.map((item) => (
            <Link key={item.path} href={item.path} className={linkClasses(item.path)}>
              {item.label}
            </Link>
          ))}

          <a href={PLANS_URL} className="px-4 py-2 rounded-xl text-white/80 hover:text-yellow-400 transition-colors" onClick={openPlans}>Plans</a>

          {isLoggedIn ? (
            <>
              <span className={badgeClasses}>{loadingPlan ? "PLAN : ..." : `PLAN : ${planLabel(plan)}`}</span>
              {showUpgrade ? (
                <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ffb800] to-[#ffcc4d] text-black font-semibold hover:-translate-y-0.5 transition-all" onClick={openPlans}>Upgrade</button>
              ) : null}
              <button className="px-4 py-2 rounded-xl border border-yellow-600/25 text-yellow-100 hover:bg-yellow-500/10 transition-all" onClick={logout}>Se déconnecter</button>
            </>
          ) : (
            <Link href={LOGIN_PATH} className="px-4 py-2 rounded-xl border border-yellow-600/25 text-yellow-100 hover:bg-yellow-500/10 transition-all">Se connecter</Link>
          )}
        </nav>

        <div className="md:hidden flex items-center gap-3">
          {isLoggedIn ? <span className={badgeClasses}>{loadingPlan ? "PLAN : ..." : `PLAN : ${planLabel(plan)}`}</span> : null}
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
                  {isLoggedIn ? <span className={badgeClasses}>{loadingPlan ? "PLAN : ..." : `PLAN : ${planLabel(plan)}`}</span> : <span className={badgeClasses}>VISITEUR</span>}
                  {showUpgrade ? <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ffb800] to-[#ffcc4d] text-black font-semibold" onClick={openPlans}>Upgrade</button> : null}
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3">
                  {NAV_ITEMS.map((item) => (
                    <button key={item.path} className={isActive(pathname, item.path) ? drawerBtnActive : drawerBtn} onClick={() => go(item.path)}>
                      <span>{item.label}</span><span className="text-white/40">→</span>
                    </button>
                  ))}

                  <a href={PLANS_URL} className={drawerBtn} onClick={openPlans}><span>Plans</span><span className="text-white/40">→</span></a>

                  {isLoggedIn ? (
                    <button className={drawerBtn} onClick={logout}><span>Se déconnecter</span><span className="text-white/40">→</span></button>
                  ) : (
                    <button className={drawerBtn} onClick={() => go(LOGIN_PATH)}><span>Se connecter</span><span className="text-white/40">→</span></button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
