"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { useEffect, useState } from "react";

type Plan = "none" | "azur" | "essentiel" | "pro" | "ultime";

const PLANS_URL = process.env.NEXT_PUBLIC_SYSTEMEIO_PLANS_URL ?? "https://legenerateurdigital.systeme.io/lgd";
const DASHBOARD_PATH = "/dashboard";
const AFFILIATION_PATH = "/dashboard/affiliation";
const EDITOR_PATH = "/dashboard/automatisations/reseaux_sociaux/editor-intelligent";
const PLANNER_PATH = "/dashboard/planner";
const COACH_PATH = "/dashboard/coach-ia";
const LEADS_PATH = "/dashboard/lead-engine";
const EMAIL_CAMPAIGNS_PATH = "/dashboard/email-campaigns";
const SETTINGS_PATH = "/dashboard/settings";
const LOGIN_PATH = "/auth/login";

type NavItem = {
  label: string;
  path: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: DASHBOARD_PATH },
  { label: "Affiliation", path: AFFILIATION_PATH },
  { label: "Éditeur", path: EDITOR_PATH },
  { label: "Planner IA", path: PLANNER_PATH },
  { label: "Leads IA", path: LEADS_PATH },
  { label: "Coach", path: COACH_PATH },
  { label: "Emailing IA", path: EMAIL_CAMPAIGNS_PATH },
  { label: "Paramètres", path: SETTINGS_PATH },
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
  if (v === "essentiel") return "essentiel";
  if (v === "trial" || v === "azur" || v === "starter" || v === "decouverte" || v === "découverte") return "azur";

  // Quotas LGD officiels 2026 + compat anciens quotas
  if (limit === 150000 || limit === 70000) return "azur";
  if (limit === 15000000 || limit === 2500000) return "ultime";
  if (limit === 6000000 || limit === 1000000) return "pro";
  if (limit === 2000000 || limit === 400000) return "essentiel";

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
  const [loggingOut, setLoggingOut] = useState(false);

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
    `group relative inline-flex items-center whitespace-nowrap rounded-2xl px-3 py-2.5 text-[13px] font-semibold transition-all duration-300 ${
      isActive(pathname, path)
        ? "bg-gradient-to-r from-[#f5bf21] to-[#ffd76a] text-black shadow-[0_0_24px_rgba(245,191,33,0.24)]"
        : "text-white/78 hover:bg-white/[0.04] hover:text-[#f5bf21]"
    }`;

  const badgeClasses =
    plan === "ultime"
      ? "inline-flex items-center rounded-full bg-gradient-to-r from-[#f5bf21] to-[#ffd76a] px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.08em] text-black shadow-[0_0_22px_rgba(245,191,33,0.2)]"
      : plan === "pro"
      ? "inline-flex items-center rounded-full border border-[#f5bf21]/55 bg-black/45 px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.08em] text-[#ffe49a]"
      : plan === "essentiel"
      ? "inline-flex items-center rounded-full border border-[#f5bf21]/35 bg-black/45 px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.08em] text-[#ffe49a]"
      : plan === "azur"
      ? "inline-flex items-center rounded-full border border-[#f5bf21]/45 bg-black/45 px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.08em] text-[#fff0b7]"
      : "inline-flex items-center rounded-full border border-white/10 bg-black/35 px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.08em] text-white/55";

  const drawerBtn = "w-full inline-flex items-center justify-between rounded-2xl border border-[#f5bf21]/18 bg-[#11100a] px-4 py-4 text-white/92 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition-all hover:border-[#f5bf21]/35 hover:bg-[#17130a] hover:text-[#f5bf21]";
  const drawerBtnActive = "w-full inline-flex items-center justify-between rounded-2xl border border-[#f5bf21]/60 bg-[#f5bf21]/14 px-4 py-4 text-[#ffe49a] shadow-[0_0_24px_rgba(245,191,33,0.12)]";

  const showUpgrade = isLoggedIn && plan !== "ultime";

  function isPublicNavPath(path: string) {
    return path === DASHBOARD_PATH || path === AFFILIATION_PATH;
  }

  function go(path: string) {
    setMenuOpen(false);

    if (!isLoggedIn && !isPublicNavPath(path)) {
      router.push(LOGIN_PATH);
      return;
    }

    router.push(path);
  }

  function openPlans(e?: MouseEvent) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setMenuOpen(false);
    window.open(PLANS_URL, "_blank", "noopener,noreferrer");
  }

  function clearAuthState() {
    if (typeof window === "undefined") return;

    const keysToRemove = [
      "access_token",
      "lgd_token",
      "token",
      "jwt",
      "refresh_token",
      "lgd_refresh_token",
      "lgd_user",
      "lgd_user_email",
      "lgd_auth_user",
      "lgd_plan_ultime",
      "lgd_plan_pro",
      "lgd_plan_essentiel",
      "lgd_plan_starter",
      "lgd_plan_trial",
    ];

    for (const key of keysToRemove) {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    }

    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("lgd-auth-changed", { detail: { loggedIn: false } }));
  }

  function logout() {
    if (loggingOut) return;

    setLoggingOut(true);
    clearAuthState();
    setPlan("none");
    setIsLoggedIn(false);
    setLoadingPlan(false);
    setMenuOpen(false);

    window.setTimeout(() => {
      router.replace(LOGIN_PATH);
      router.refresh();
    }, 180);
  }

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-[#f5bf21]/15 bg-[#050505]/88 shadow-[0_12px_50px_rgba(0,0,0,0.38)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f5bf21]/70 to-transparent" />
      <div className="pointer-events-none absolute -top-20 left-1/2 h-28 w-[640px] -translate-x-1/2 rounded-full bg-[#f5bf21]/10 blur-3xl" />

      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3.5 sm:px-5">
        <Link href={DASHBOARD_PATH} className="group flex min-w-fit items-center gap-3 rounded-2xl px-1 py-1 transition-all duration-300 hover:scale-[1.01]">
          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-[#f5bf21] via-[#ffe49a] to-[#ff9f1c] bg-clip-text text-lg font-black tracking-[-0.03em] text-transparent sm:text-xl">
                Le Générateur Digital
              </span>
              <span className="hidden rounded-full border border-[#f5bf21]/25 bg-[#f5bf21]/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-[#f5bf21] lg:inline-flex">IA</span>
            </div>
            <div className="hidden text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35 lg:block">Business · IA · Conversion</div>
          </div>
        </Link>

        <nav className="hidden min-w-0 items-center gap-1 xl:flex">
          {NAV_ITEMS.map((item) => {
            if (isLoggedIn || isPublicNavPath(item.path)) {
              return (
                <Link key={item.path} href={item.path} className={linkClasses(item.path)}>
                  {item.label}
                </Link>
              );
            }

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => go(item.path)}
                className={linkClasses(item.path)}
                title="Connecte-toi pour utiliser ce module"
              >
                {item.label}
              </button>
            );
          })}

          <a href={PLANS_URL} className="whitespace-nowrap rounded-2xl px-3 py-2.5 text-[13px] font-semibold text-white/78 transition-all hover:bg-white/[0.04] hover:text-[#f5bf21]" onClick={openPlans}>Plans</a>

          {isLoggedIn ? (
            <>
              {showUpgrade ? (
                <motion.button type="button" whileHover={{ y: -1, scale: 1.02 }} whileTap={{ scale: 0.98 }} className="whitespace-nowrap rounded-2xl bg-gradient-to-r from-[#f5bf21] via-[#ffd76a] to-[#ffb000] px-3 py-2.5 text-[13px] font-black text-black shadow-[0_0_26px_rgba(245,191,33,0.24)] transition-all" onClick={openPlans}>Upgrade</motion.button>
              ) : null}
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                disabled={loggingOut}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-2xl border border-[#f5bf21]/25 bg-black/20 px-3 py-2.5 text-[13px] font-bold text-[#ffe49a] transition-all hover:border-[#f5bf21]/55 hover:bg-[#f5bf21]/10 hover:shadow-[0_0_22px_rgba(245,191,33,0.12)] disabled:cursor-wait disabled:opacity-70"
                onClick={logout}
              >
                <span className={loggingOut ? "inline-block h-2 w-2 animate-pulse rounded-full bg-yellow-300" : "inline-block h-2 w-2 rounded-full bg-yellow-500/70"} />
                {loggingOut ? "Déconnexion..." : "Se déconnecter"}
              </motion.button>
            </>
          ) : (
            <Link href={LOGIN_PATH} className="whitespace-nowrap rounded-2xl border border-[#f5bf21]/30 bg-black/25 px-3 py-2.5 text-[13px] font-bold text-[#ffe49a] transition-all hover:border-[#f5bf21]/60 hover:bg-[#f5bf21]/10 hover:shadow-[0_0_22px_rgba(245,191,33,0.12)]">Se connecter</Link>
          )}
        </nav>

        <div className="flex items-center gap-3 xl:hidden">
          <button className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#f5bf21]/35 bg-black/35 text-2xl leading-none text-[#f5bf21] shadow-[0_0_22px_rgba(245,191,33,0.1)] transition-all hover:bg-[#f5bf21]/10" onClick={() => setMenuOpen(true)} aria-label="Ouvrir le menu">☰</button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[100] xl:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-[#020202]/96"
              onClick={() => setMenuOpen(false)}
            />

            <motion.div
              initial={{ x: 28, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 28, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col border-l border-[#f5bf21]/18 bg-[#050505] shadow-[0_0_90px_rgba(0,0,0,0.9)]"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,191,33,0.12),transparent_42%)]" />

              <div className="relative flex items-center justify-between border-b border-[#f5bf21]/14 px-5 pb-4 pt-[max(18px,env(safe-area-inset-top))]">
                <div className="min-w-0">
                  <div className="truncate bg-gradient-to-r from-[#f5bf21] to-[#ffe49a] bg-clip-text text-xl font-black tracking-[-0.03em] text-transparent">
                    Menu LGD
                  </div>
                  <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">
                    Business · IA · Conversion
                  </div>
                </div>

                <button
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#f5bf21]/30 bg-[#12100a] text-lg font-bold text-[#ffe49a] transition-all hover:bg-[#f5bf21]/10"
                  aria-label="Fermer le menu"
                >
                  ✕
                </button>
              </div>

              <div className="relative flex-1 overflow-y-auto px-5 py-5" style={{ WebkitOverflowScrolling: "touch" }}>
                {showUpgrade ? (
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    className="mb-4 w-full rounded-2xl bg-gradient-to-r from-[#f5bf21] via-[#ffd76a] to-[#ffb000] px-4 py-3 text-sm font-black text-black shadow-[0_0_24px_rgba(245,191,33,0.2)]"
                    onClick={openPlans}
                  >
                    Upgrade
                  </motion.button>
                ) : null}

                <div className="grid grid-cols-1 gap-3">
                  {NAV_ITEMS.map((item) => (
                    <button
                      key={item.path}
                      className={isActive(pathname, item.path) ? drawerBtnActive : drawerBtn}
                      onClick={() => go(item.path)}
                    >
                      <span className="font-semibold">{item.label}</span>
                      <span className="text-white/40">→</span>
                    </button>
                  ))}

                  <a href={PLANS_URL} className={drawerBtn} onClick={openPlans}>
                    <span className="font-semibold">Plans</span>
                    <span className="text-white/40">→</span>
                  </a>
                </div>
              </div>

              <div className="relative border-t border-[#f5bf21]/14 bg-[#050505] px-5 pb-[max(18px,env(safe-area-inset-bottom))] pt-4">
                {isLoggedIn ? (
                  <button
                    className="flex w-full items-center justify-between rounded-2xl border border-[#f5bf21]/30 bg-[#141006] px-4 py-4 text-left text-sm font-black text-[#ffe49a] shadow-[0_0_22px_rgba(245,191,33,0.08)] transition-all hover:bg-[#f5bf21]/10 disabled:cursor-wait disabled:opacity-70"
                    onClick={logout}
                    disabled={loggingOut}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className={loggingOut ? "inline-block h-2 w-2 animate-pulse rounded-full bg-yellow-300" : "inline-block h-2 w-2 rounded-full bg-yellow-500/70"} />
                      {loggingOut ? "Déconnexion..." : "Se déconnecter"}
                    </span>
                    <span className="text-white/40">→</span>
                  </button>
                ) : (
                  <button
                    className="flex w-full items-center justify-between rounded-2xl border border-[#f5bf21]/30 bg-[#141006] px-4 py-4 text-left text-sm font-black text-[#ffe49a] shadow-[0_0_22px_rgba(245,191,33,0.08)] transition-all hover:bg-[#f5bf21]/10"
                    onClick={() => go(LOGIN_PATH)}
                  >
                    <span>Se connecter</span>
                    <span className="text-white/40">→</span>
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
