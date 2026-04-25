"use client";

import { loginUser } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

const LGD_SIGNUP_URL = "https://legenerateurdigital.systeme.io/lgd";
const TRIAL_URL = "https://legenerateurdigital.systeme.io/trial";

function sanitizeNext(next: string | null): string {
  const raw = String(next || "").trim();

  if (!raw) return "/dashboard";
  if (!raw.startsWith("/")) return "/dashboard";
  if (raw.startsWith("//")) return "/dashboard";

  return raw;
}

function getErrorMessage(error: unknown): string {
  if (typeof error === "string" && error.trim()) return error;

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Impossible de vous connecter pour le moment.";
}

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const targetAfterLogin = useMemo(() => {
    return sanitizeNext(searchParams.get("next"));
  }, [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      await loginUser(email.trim(), password);
      router.replace(targetAfterLogin);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030303] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-140px] top-[-120px] h-[430px] w-[430px] rounded-full bg-[#f5bf21]/14 blur-[125px]" />
        <div className="absolute bottom-[-160px] right-[-120px] h-[460px] w-[460px] rounded-full bg-[#7c3aed]/14 blur-[130px]" />
        <div className="absolute left-[35%] top-[18%] h-[240px] w-[240px] rounded-full bg-[#f5bf21]/8 blur-[105px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f5bf21]/35 to-transparent" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center">
        <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative hidden overflow-hidden rounded-[34px] border border-[#f5bf21]/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))] p-9 shadow-[0_0_80px_rgba(0,0,0,0.48)] lg:block">
            <div className="absolute right-[-90px] top-[-90px] h-72 w-72 rounded-full bg-[#f5bf21]/12 blur-[85px]" />
            <div className="relative">
              <a
                href="/dashboard"
                className="inline-flex items-center gap-3 rounded-full border border-[#f5bf21]/22 bg-black/35 px-4 py-2 text-sm font-semibold text-[#f5bf21] transition hover:border-[#f5bf21]/45 hover:bg-[#f5bf21]/8"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f5bf21] text-black">
                  LGD
                </span>
                Le Générateur Digital
              </a>

              <div className="mt-12 max-w-xl">
                <div className="mb-5 inline-flex rounded-full border border-[#f5bf21]/25 bg-[#f5bf21]/8 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#f5bf21]">
                  Centre de contrôle premium
                </div>

                <h1 className="text-5xl font-black leading-[1.02] tracking-tight md:text-6xl">
                  Reviens piloter ton business avec
                  <span className="block bg-gradient-to-r from-[#f5bf21] via-[#ffd76a] to-[#f5bf21] bg-clip-text text-transparent">
                    l’IA LGD.
                  </span>
                </h1>

                <p className="mt-6 max-w-lg text-lg leading-8 text-white/72">
                  Connecte-toi à ton espace, retrouve tes modules et reprends ton plan d’action avec Alex IA.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-4">
                <div className="rounded-[24px] border border-[#f5bf21]/16 bg-black/28 p-5">
                  <div className="text-3xl">🤖</div>
                  <div className="mt-3 font-bold text-[#f5bf21]">Alex IA</div>
                  <div className="mt-1 text-sm leading-6 text-white/62">Ton coach digital pour passer à l’action.</div>
                </div>

                <div className="rounded-[24px] border border-[#f5bf21]/16 bg-black/28 p-5">
                  <div className="text-3xl">⚡</div>
                  <div className="mt-3 font-bold text-[#f5bf21]">Éditeur Intelligent</div>
                  <div className="mt-1 text-sm leading-6 text-white/62">Crée du contenu qui attire et convertit.</div>
                </div>

                <div className="rounded-[24px] border border-[#f5bf21]/16 bg-black/28 p-5">
                  <div className="text-3xl">🎯</div>
                  <div className="mt-3 font-bold text-[#f5bf21]">Lead Engine IA</div>
                  <div className="mt-1 text-sm leading-6 text-white/62">Transforme ton contenu en machine à prospects.</div>
                </div>

                <div className="rounded-[24px] border border-[#f5bf21]/16 bg-black/28 p-5">
                  <div className="text-3xl">✉️</div>
                  <div className="mt-3 font-bold text-[#f5bf21]">Emailing IA</div>
                  <div className="mt-1 text-sm leading-6 text-white/62">Prépare des séquences prêtes à vendre.</div>
                </div>
              </div>

              <div className="mt-8 rounded-[24px] border border-[#f5bf21]/20 bg-[#f5bf21]/8 p-5 text-sm leading-7 text-white/76">
                ✨ Accès sécurisé · données sauvegardées · quotas IA synchronisés avec ton plan.
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[34px] border border-[#f5bf21]/22 bg-[#0c0c0c]/88 p-7 shadow-[0_0_70px_rgba(245,191,33,0.09)] sm:p-9">
            <div className="absolute left-[-80px] top-[-80px] h-56 w-56 rounded-full bg-[#f5bf21]/10 blur-[80px]" />
            <div className="absolute bottom-[-100px] right-[-80px] h-64 w-64 rounded-full bg-[#7c3aed]/10 blur-[85px]" />

            <div className="relative">
              <div className="mb-8 text-center">
                <a
                  href="/dashboard"
                  className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[26px] border border-[#f5bf21]/25 bg-[linear-gradient(180deg,rgba(245,191,33,0.22),rgba(245,191,33,0.04))] text-2xl font-black text-[#f5bf21] shadow-[0_0_38px_rgba(245,191,33,0.16)]"
                >
                  LGD
                </a>

                <h2 className="text-3xl font-black tracking-tight text-white">
                  Connexion <span className="text-[#f5bf21]">LGD</span>
                </h2>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/64">
                  Accède à ton espace Le Générateur Digital et reprends là où tu t’es arrêté.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-bold text-[#f8d66f]">
                    Adresse email
                  </label>
                  <div className="group flex items-center gap-3 rounded-[18px] border border-white/12 bg-black/40 px-4 py-1 transition focus-within:border-[#f5bf21]/55 focus-within:ring-2 focus-within:ring-[#f5bf21]/12">
                    <span className="text-white/42">✉️</span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vous@exemple.com"
                      className="w-full bg-transparent px-1 py-4 text-white outline-none placeholder:text-white/35"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-bold text-[#f8d66f]">
                    Mot de passe
                  </label>
                  <div className="group flex items-center gap-3 rounded-[18px] border border-white/12 bg-black/40 px-4 py-1 transition focus-within:border-[#f5bf21]/55 focus-within:ring-2 focus-within:ring-[#f5bf21]/12">
                    <span className="text-white/42">🔒</span>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Votre mot de passe"
                      className="w-full bg-transparent px-1 py-4 text-white outline-none placeholder:text-white/35"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="rounded-full px-2 py-1 text-sm text-white/45 transition hover:text-[#f5bf21]"
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <a href="/auth/forgot-password" className="text-sm font-semibold text-[#f5bf21] transition hover:text-[#ffd76a] hover:underline">
                    Mot de passe oublié ?
                  </a>
                </div>

                {error ? (
                  <div className="rounded-[18px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-100">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-[18px] border border-[#f5bf21]/35 bg-gradient-to-r from-[#f5bf21] via-[#ffd76a] to-[#f5bf21] px-5 py-4 text-base font-black text-black shadow-[0_0_34px_rgba(245,191,33,0.24)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Connexion en cours..." : "Se connecter"}
                </button>
              </form>

              <div className="mt-6 rounded-[20px] border border-white/10 bg-black/24 p-4 text-center text-sm text-white/68">
                <span>Pas encore de compte ? </span>
                <a
                  href={LGD_SIGNUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-black text-[#f5bf21] transition hover:text-[#ffd76a]"
                >
                  Créer un compte
                </a>
              </div>

              <a
                href={TRIAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex w-full items-center justify-center rounded-[18px] border border-[#7c3aed]/35 bg-[linear-gradient(90deg,rgba(124,58,237,0.28),rgba(245,191,33,0.16))] px-5 py-4 text-center text-sm font-black text-white transition hover:border-[#f5bf21]/45 hover:bg-[#f5bf21]/10"
              >
                🚀 Tester LGD gratuitement pendant 7 jours
              </a>

              <div className="mt-7 grid grid-cols-3 gap-3 text-center text-[11px] text-white/52">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-2 py-3">🔐 Sécurisé</div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-2 py-3">⚡ Rapide</div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-2 py-3">🤖 IA prête</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
