"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SYSTEMEIO_PLANS_URL =
  process.env.NEXT_PUBLIC_SYSTEMEIO_PLANS_URL || "https://legenerateurdigital.systeme.io/lgd";
const SYSTEMEIO_AFFILIATION_URL =
  process.env.NEXT_PUBLIC_SYSTEMEIO_AFFILIATION_URL || "https://legenerateurdigital.systeme.io/affiliation-lgd";

const LOGIN_PATH = "/auth/login";

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

function openExternal(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export default function LGDWorkspaceSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const workspace = searchParams.get("workspace") || "home";

  const isLoggedIn = Boolean(getStoredToken());

  function go(path: string, protectedRoute = true) {
    if (protectedRoute && !isLoggedIn) {
      router.push(LOGIN_PATH);
      return;
    }
    router.push(path);
  }

  function handleLogout() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("access_token");
      window.localStorage.removeItem("lgd_token");
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("jwt");
      window.localStorage.removeItem("user");
      window.localStorage.removeItem("lgd_user");
      document.cookie = "access_token=; Max-Age=0; path=/";
      document.cookie = "token=; Max-Age=0; path=/";
      document.cookie = "lgd_token=; Max-Age=0; path=/";
    }

    router.push(LOGIN_PATH);
  }

  const baseButton =
    "rounded-2xl px-4 py-2.5 text-left text-white/72 transition hover:bg-yellow-500/10 hover:text-yellow-100";
  const activeButton =
    "rounded-2xl border border-yellow-600/15 bg-yellow-500/10 px-4 py-2.5 text-left font-semibold text-yellow-100 transition hover:bg-yellow-500/15";
  const premiumButton =
    "rounded-2xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-2.5 text-left font-semibold text-yellow-100 transition hover:bg-yellow-500/10";

  function isActive(path: string) {
    return pathname === path || pathname.startsWith(`${path}/`);
  }

  return (
    <>
      <aside className="fixed left-4 top-4 z-[2147483646] hidden h-[calc(100vh-32px)] w-[280px] flex-col overflow-hidden rounded-[30px] border border-yellow-600/20 bg-[#070707]/95 p-4 shadow-[0_0_55px_rgba(255,184,0,0.08)] backdrop-blur-xl lg:flex">
        <nav className="grid gap-1.5 text-sm">
          <button
            type="button"
            onClick={() => go("/dashboard", false)}
            className={pathname === "/dashboard" && workspace !== "activity" ? activeButton : baseButton}
          >
            🏠 Accueil
          </button>
          <button
            type="button"
            onClick={() => go("/dashboard", false)}
            className={baseButton}
          >
            🎯 Mission Cash IA
          </button>
          <button
            type="button"
            onClick={() => go("/dashboard/coach-ia")}
            className={isActive("/dashboard/coach-ia") ? activeButton : baseButton}
          >
            🧠 Coach Alex IA
          </button>

          <div className="my-2 border-t border-yellow-600/15" />

          <button
            type="button"
            onClick={() => go("/dashboard/automatisations/reseaux_sociaux/editor-intelligent")}
            className={isActive("/dashboard/automatisations/reseaux_sociaux/editor-intelligent") ? activeButton : baseButton}
          >
            ✍️ Éditeur Intelligent
          </button>
          <button
            type="button"
            onClick={() => go("/dashboard/email-campaigns")}
            className={isActive("/dashboard/email-campaigns") ? activeButton : baseButton}
          >
            📧 Emailing IA
          </button>
          <button
            type="button"
            onClick={() => go("/dashboard/lead-engine")}
            className={isActive("/dashboard/lead-engine") ? activeButton : baseButton}
          >
            🧲 Lead Engine IA
          </button>
          <button
            type="button"
            onClick={() => go("/dashboard/automatisations/reseaux_sociaux/planner")}
            className={isActive("/dashboard/automatisations/reseaux_sociaux/planner") ? activeButton : baseButton}
          >
            📅 Planner IA
          </button>
          <button
            type="button"
            onClick={() => go("/dashboard/library")}
            className={isActive("/dashboard/library") ? activeButton : baseButton}
          >
            📚 Bibliothèque
          </button>
        </nav>

        <div className="mt-4 grid gap-2 border-t border-yellow-600/15 pt-4 text-sm">
          <button
            type="button"
            onClick={() => openExternal(SYSTEMEIO_PLANS_URL)}
            className={baseButton}
          >
            👑 Plans
          </button>
          <button
            type="button"
            onClick={() => go("/dashboard/settings")}
            className={isActive("/dashboard/settings") ? activeButton : baseButton}
          >
            ⚙️ Paramètres
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-left font-semibold text-red-100 transition hover:bg-red-500/10"
          >
            🚪 Se déconnecter
          </button>
        </div>

        <div className="mt-4 grid gap-2 border-t border-yellow-600/15 pt-4 text-sm">
          <button
            type="button"
            onClick={() => go("/dashboard?workspace=activity", false)}
            className={workspace === "activity" ? activeButton : premiumButton}
          >
            📈 Activité Progression
          </button>
          <button
            type="button"
            onClick={() => openExternal(SYSTEMEIO_AFFILIATION_URL)}
            className={premiumButton}
          >
            💰 Programme d'affiliation LGD
          </button>
        </div>
      </aside>

      <div className="sticky top-0 z-[2147483646] border-b border-yellow-600/15 bg-[#050505]/92 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-black text-yellow-400">LGD 3.0</div>
            <div className="mt-1 inline-flex items-center gap-2 text-[11px] font-semibold text-green-200">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              IA Business Active
            </div>
          </div>
          <button
            type="button"
            onClick={() => go("/dashboard", false)}
            className="rounded-2xl border border-yellow-600/25 bg-[#0b0b0b] px-4 py-2 text-sm font-semibold text-yellow-100"
          >
            Accueil
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 rounded-3xl border border-yellow-600/20 bg-[#080808] p-3 text-sm shadow-[0_0_45px_rgba(255,184,0,0.12)] sm:grid-cols-3">
          <button type="button" onClick={() => go("/dashboard/coach-ia")} className="rounded-2xl px-3 py-2.5 text-left text-white/75 hover:bg-yellow-500/10">🧠 Coach</button>
          <button type="button" onClick={() => go("/dashboard/automatisations/reseaux_sociaux/editor-intelligent")} className="rounded-2xl px-3 py-2.5 text-left text-white/75 hover:bg-yellow-500/10">✍️ Éditeur</button>
          <button type="button" onClick={() => go("/dashboard/email-campaigns")} className="rounded-2xl px-3 py-2.5 text-left text-white/75 hover:bg-yellow-500/10">📧 Emailing</button>
          <button type="button" onClick={() => go("/dashboard/lead-engine")} className="rounded-2xl px-3 py-2.5 text-left text-white/75 hover:bg-yellow-500/10">🧲 Leads</button>
          <button type="button" onClick={() => go("/dashboard/automatisations/reseaux_sociaux/planner")} className="rounded-2xl px-3 py-2.5 text-left text-white/75 hover:bg-yellow-500/10">📅 Planner</button>
          <button type="button" onClick={() => go("/dashboard/library")} className="rounded-2xl px-3 py-2.5 text-left text-white/75 hover:bg-yellow-500/10">📚 Biblio</button>
          <button type="button" onClick={() => go("/dashboard?workspace=activity", false)} className="rounded-2xl border border-yellow-600/15 bg-yellow-500/5 px-3 py-2.5 text-left font-semibold text-yellow-100">📈 Activité</button>
          <button type="button" onClick={() => openExternal(SYSTEMEIO_AFFILIATION_URL)} className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-3 py-2.5 text-left font-semibold text-yellow-100">💰 Ambassadeurs</button>
          <button type="button" onClick={handleLogout} className="rounded-2xl border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-left font-semibold text-red-100 hover:bg-red-500/10">🚪 Sortir</button>
        </div>
      </div>
    </>
  );
}
