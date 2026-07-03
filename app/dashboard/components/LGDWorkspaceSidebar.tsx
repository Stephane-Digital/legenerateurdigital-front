"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const LOGIN_PATH = "/auth/login";

const SYSTEMEIO_PLANS_URL =
  process.env.NEXT_PUBLIC_SYSTEMEIO_PLANS_URL || "https://legenerateurdigital.systeme.io/lgd";
const SYSTEMEIO_AFFILIATION_URL =
  process.env.NEXT_PUBLIC_SYSTEMEIO_AFFILIATION_URL || "https://legenerateurdigital.systeme.io/affiliation-lgd";

function openExternal(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

function clearAuthStorage() {
  if (typeof window === "undefined") return;

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

function isUserLoggedIn() {
  if (typeof window === "undefined") return false;

  return Boolean(
    window.localStorage.getItem("access_token") ||
      window.localStorage.getItem("lgd_token") ||
      window.localStorage.getItem("token") ||
      window.localStorage.getItem("jwt")
  );
}

export default function LGDWorkspaceSidebar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function go(path: string) {
    setMobileMenuOpen(false);
    router.push(path);
  }

  function requireLogin(path: string) {
    setMobileMenuOpen(false);

    if (!isUserLoggedIn()) {
      router.push(LOGIN_PATH);
      return;
    }

    router.push(path);
  }

  function openPlans() {
    setMobileMenuOpen(false);
    openExternal(SYSTEMEIO_PLANS_URL);
  }

  function openAffiliationProgram() {
  setMobileMenuOpen(false);
  router.push("/dashboard/affiliation");
}

  function handleLogout() {
    clearAuthStorage();
    setMobileMenuOpen(false);
    router.push(LOGIN_PATH);
  }

  const navButton =
    "rounded-2xl px-5 py-3 text-left text-[15px] font-medium text-white/85 transition hover:bg-yellow-500/10 hover:text-yellow-100";

  const mobileButton =
    "rounded-2xl px-5 py-3 text-left text-[15px] font-medium text-white/85 transition hover:bg-yellow-500/10 hover:text-yellow-100";

  return (
    <>
      <aside className="fixed left-4 top-4 z-[2147483646] hidden h-[calc(100vh-32px)] w-[280px] flex-col overflow-hidden rounded-[30px] border border-yellow-600/20 bg-[#070707]/95 p-4 shadow-[0_0_55px_rgba(255,184,0,0.08)] backdrop-blur-xl lg:flex">
        <div className="mb-4 flex justify-center border-b border-yellow-600/15 pb-4">
          <img
            src="/images/logo-side-bar2.png"
            alt="Le Générateur Digital"
            className="h-auto w-[205px] select-none object-contain"
            draggable={false}
          />
        </div>

        <nav className="grid gap-2 text-[15px]">
          <button
            type="button"
            onClick={() => go("/dashboard")}
            className="rounded-2xl border border-yellow-600/15 bg-yellow-500/10 px-5 py-3 text-semibold text-[30px] font-semibold text-yellow-100 transition hover:bg-yellow-500/15"
          >
            🏠 Accueil
          </button>

          <button type="button" onClick={() => go("/dashboard")} className={navButton}>
            🎯 Mission Cash IA
          </button>

          <button type="button" onClick={() => requireLogin("/dashboard/coach-ia")} className={navButton}>
            🧠 Coach Alex IA
          </button>

          <div className="my-2 border-t border-yellow-600/15" />

          <button
            type="button"
            onClick={() => requireLogin("/dashboard/automatisations/reseaux_sociaux/editor-intelligent")}
            className={navButton}
          >
            ✍️ Éditeur Intelligent
          </button>

          <button type="button" onClick={() => requireLogin("/dashboard/email-campaigns")} className={navButton}>
            📧 Emailing IA
          </button>

          <button type="button" onClick={() => requireLogin("/dashboard/lead-engine")} className={navButton}>
            🧲 Lead Magnet IA
          </button>

          <button
            type="button"
            onClick={() => requireLogin("/dashboard/automatisations/reseaux_sociaux/planner")}
            className={navButton}
          >
            📅 Planner IA
          </button>

          <button type="button" onClick={() => requireLogin("/dashboard/library")} className={navButton}>
            📚 Bibliothèque
          </button>
        </nav>

        <div className="mt-4 grid gap-2 border-t border-yellow-600/15 pt-4 text-[15px]">
          <button type="button" onClick={openPlans} className={navButton}>
            👑 Voir lesPlans
          </button>

          <button type="button" onClick={() => requireLogin("/dashboard/settings")} className={navButton}>
            ⚙️ Paramètres
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-3 text-left text-[15px] font-semibold text-red-100 transition hover:bg-red-500/10"
          >
            🚪 Se déconnecter
          </button>
        </div>

        <div className="mt-4 grid gap-2 border-t border-yellow-600/15 pt-4 text-[15px]">
          <button
            type="button"
            onClick={() => go("/dashboard?workspace=activity")}
            className="rounded-2xl border border-yellow-600/15 bg-yellow-500/5 px-5 py-3 text-left text-[15px] font-semibold text-yellow-100 transition hover:bg-yellow-500/10"
          >
            📈 Activité Progression
          </button>

          <button
            type="button"
            onClick={openAffiliationProgram}
            className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 px-5 py-3 text-left text-[15px] font-semibold text-yellow-100 transition hover:bg-yellow-500/10"
          >
            💰 Programme d&apos;affiliation LGD
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
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="rounded-2xl border border-yellow-600/25 bg-[#0b0b0b] px-4 py-2 text-sm font-semibold text-yellow-100"
          >
            {mobileMenuOpen ? "Fermer" : "Modules"}
          </button>
        </div>

        {mobileMenuOpen ? (
          <div className="mt-4 grid gap-2 rounded-3xl border border-yellow-600/20 bg-[#080808] p-3 text-[15px] shadow-[0_0_45px_rgba(255,184,0,0.12)]">
            <button
              type="button"
              onClick={() => go("/dashboard")}
              className="rounded-2xl bg-yellow-500/10 px-5 py-3 text-left text-[15px] font-semibold text-yellow-100"
            >
              🏠 Accueil
            </button>

            <button type="button" onClick={() => requireLogin("/dashboard/coach-ia")} className={mobileButton}>
              🧠 Coach Alex IA
            </button>

            <button
              type="button"
              onClick={() => requireLogin("/dashboard/automatisations/reseaux_sociaux/editor-intelligent")}
              className={mobileButton}
            >
              ✍️ Éditeur Intelligent
            </button>

            <button type="button" onClick={() => requireLogin("/dashboard/email-campaigns")} className={mobileButton}>
              📧 Emailing IA
            </button>

            <button type="button" onClick={() => requireLogin("/dashboard/lead-engine")} className={mobileButton}>
              🧲 Lead Engine IA
            </button>

            <button
              type="button"
              onClick={() => requireLogin("/dashboard/automatisations/reseaux_sociaux/planner")}
              className={mobileButton}
            >
              📅 Planner IA
            </button>

            <button type="button" onClick={() => requireLogin("/dashboard/library")} className={mobileButton}>
              📚 Bibliothèque
            </button>

            <button
              type="button"
              onClick={() => go("/dashboard?workspace=activity")}
              className="rounded-2xl border border-yellow-600/15 bg-black/35 px-5 py-3 text-left text-[15px] font-medium text-white/85"
            >
              📈 Activité Progression
            </button>

            <button
              type="button"
              onClick={openAffiliationProgram}
              className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-5 py-3 text-left text-[15px] font-semibold text-yellow-100"
            >
              💰 Programme Ambassadeur LGD
            </button>

            <button type="button" onClick={openPlans} className="rounded-2xl px-5 py-3 text-left text-[15px] font-medium text-white/85 hover:bg-yellow-500/10">
              👑 Plans
            </button>

            <button
              type="button"
              onClick={() => requireLogin("/dashboard/settings")}
              className="rounded-2xl px-5 py-3 text-left text-[15px] font-medium text-white/85 hover:bg-yellow-500/10"
            >
              ⚙️ Paramètres
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-3 text-left text-[15px] font-semibold text-red-100 hover:bg-red-500/10"
            >
              🚪 Se déconnecter
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}
