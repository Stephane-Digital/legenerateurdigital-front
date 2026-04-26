"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { MouseEvent } from "react";

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
    `group relative inline-flex items-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
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

  const drawerBtn = "w-full inline-flex items-center justify-between rounded-2xl border border-[#f5bf21]/15 bg-black/35 px-4 py-4 text-white/90 transition-all hover:border-[#f5bf21]/35 hover:bg-white/[0.04] hover:text-[#f5bf21]";
  const drawerBtnActive = "w-full inline-flex items-center justify-between rounded-2xl border border-[#f5bf21]/55 bg-[#f5bf21]/10 px-4 py-4 text-[#ffe49a] shadow-[0_0_24px_rgba(245,191,33,0.12)]";

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

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-3.5">
        <Link href={DASHBOARD_PATH} className="group flex min-w-fit items-center gap-3 rounded-2xl px-1 py-1 transition-all duration-300 hover:scale-[1.01]">
          <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-[#f5bf21]/35 bg-[radial-gradient(circle_at_30%_20%,rgba(245,191,33,0.32),rgba(0,0,0,0.88)_58%)] shadow-[0_0_28px_rgba(245,191,33,0.18)]">
            <span className="absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-[#f5bf21]/15 opacity-80" />
            <span className="relative bg-gradient-to-r from-[#fff0a8] via-[#f5bf21] to-[#ff9f1c] bg-clip-text text-xl font-black italic tracking-[-0.08em] text-transparent">LGD</span>
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#f5bf21] shadow-[0_0_18px_rgba(245,191,33,0.9)]" />
          </div>

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

        <nav className="hidden items-center gap-2 md:flex">
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

          <a href={PLANS_URL} className="rounded-2xl px-4 py-2.5 text-sm font-semibold text-white/78 transition-all hover:bg-white/[0.04] hover:text-[#f5bf21]" onClick={openPlans}>Plans</a>

          {isLoggedIn ? (
            <>
              <span className={badgeClasses}>{loadingPlan ? "PLAN : ..." : `PLAN : ${planLabel(plan)}`}</span>
              {showUpgrade ? (
                <motion.button type="button" whileHover={{ y: -1, scale: 1.02 }} whileTap={{ scale: 0.98 }} className="rounded-2xl bg-gradient-to-r from-[#f5bf21] via-[#ffd76a] to-[#ffb000] px-4 py-2.5 text-sm font-black text-black shadow-[0_0_26px_rgba(245,191,33,0.24)] transition-all" onClick={openPlans}>Upgrade</motion.button>
              ) : null}
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                disabled={loggingOut}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#f5bf21]/25 bg-black/20 px-4 py-2.5 text-sm font-bold text-[#ffe49a] transition-all hover:border-[#f5bf21]/55 hover:bg-[#f5bf21]/10 hover:shadow-[0_0_22px_rgba(245,191,33,0.12)] disabled:cursor-wait disabled:opacity-70"
                onClick={logout}
              >
                <span className={loggingOut ? "inline-block h-2 w-2 animate-pulse rounded-full bg-yellow-300" : "inline-block h-2 w-2 rounded-full bg-yellow-500/70"} />
                {loggingOut ? "Déconnexion..." : "Se déconnecter"}
              </motion.button>
            </>
          ) : (
            <Link href={LOGIN_PATH} className="rounded-2xl border border-[#f5bf21]/30 bg-black/25 px-4 py-2.5 text-sm font-bold text-[#ffe49a] transition-all hover:border-[#f5bf21]/60 hover:bg-[#f5bf21]/10 hover:shadow-[0_0_22px_rgba(245,191,33,0.12)]">Se connecter</Link>
          )}
        </nav>

        <div className="md:hidden flex items-center gap-3">
          {isLoggedIn ? <span className={badgeClasses}>{loadingPlan ? "PLAN : ..." : `PLAN : ${planLabel(plan)}`}</span> : null}
          <button className="rounded-2xl border border-[#f5bf21]/25 px-3 py-2 text-2xl text-[#f5bf21] transition-all hover:bg-[#f5bf21]/10" onClick={() => setMenuOpen(true)} aria-label="Ouvrir le menu">☰</button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div className="fixed inset-0 z-[80]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/70" onClick={() => setMenuOpen(false)} />
            <motion.div initial={{ y: -20, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -20, opacity: 0, scale: 0.98 }} transition={{ duration: 0.18 }} className="absolute left-0 right-0 top-0 border-b border-[#f5bf21]/15 bg-[#050505]/96 shadow-[0_18px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
              <div className="px-5 pt-5 pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#f5bf21]/35 bg-[#f5bf21]/10 text-sm font-black text-[#f5bf21]">LGD</div>
                    <div>
                      <div className="bg-gradient-to-r from-[#f5bf21] to-[#ffe49a] bg-clip-text text-lg font-black text-transparent">Menu LGD</div>
                      <div className="text-[10px] uppercase tracking-[0.22em] text-white/35">Business · IA · Conversion</div>
                    </div>
                  </div>
                  <button onClick={() => setMenuOpen(false)} className="rounded-2xl border border-[#f5bf21]/25 px-3 py-2 text-[#ffe49a] transition-all hover:bg-[#f5bf21]/10" aria-label="Fermer le menu">✕</button>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  {isLoggedIn ? <span className={badgeClasses}>{loadingPlan ? "PLAN : ..." : `PLAN : ${planLabel(plan)}`}</span> : <span className={badgeClasses}>VISITEUR</span>}
                  {showUpgrade ? <motion.button type="button" whileTap={{ scale: 0.98 }} className="rounded-2xl bg-gradient-to-r from-[#f5bf21] via-[#ffd76a] to-[#ffb000] px-4 py-2.5 text-sm font-black text-black shadow-[0_0_24px_rgba(245,191,33,0.2)]" onClick={openPlans}>Upgrade</motion.button> : null}
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3">
                  {NAV_ITEMS.map((item) => (
                    <button key={item.path} className={isActive(pathname, item.path) ? drawerBtnActive : drawerBtn} onClick={() => go(item.path)}>
                      <span>{item.label}</span><span className="text-white/40">→</span>
                    </button>
                  ))}

                  <a href={PLANS_URL} className={drawerBtn} onClick={openPlans}><span>Plans</span><span className="text-white/40">→</span></a>

                  {isLoggedIn ? (
                    <button className={drawerBtn} onClick={logout} disabled={loggingOut}>
                      <span>{loggingOut ? "Déconnexion..." : "Se déconnecter"}</span>
                      <span className="text-white/40">→</span>
                    </button>
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
