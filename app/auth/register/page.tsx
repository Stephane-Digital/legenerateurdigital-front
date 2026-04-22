"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  FaArrowRight,
  FaBolt,
  FaBrain,
  FaCalendarAlt,
  FaCheckCircle,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaHeart,
  FaLock,
  FaRocket,
  FaShieldAlt,
  FaUser,
  FaUsers,
} from "react-icons/fa";

function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/+$/, "");
}

export default function RegisterPage() {
  const router = useRouter();
  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const trialUrl = useMemo(() => {
    return (
      process.env.NEXT_PUBLIC_SYSTEMEIO_TRIAL_URL ||
      "https://legenerateurdigital.systeme.io/lgd"
    );
  }, []);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setError("");

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    if (!cleanName || !cleanEmail || !cleanPassword) {
      setError("Merci de remplir le nom, l’email et le mot de passe.");
      return;
    }

    try {
      setLoading(true);

      const registerRes = await fetch(`${apiBaseUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPassword,
          full_name: cleanName,
        }),
      });

      const registerData = await registerRes.json().catch(() => ({}));

      if (!registerRes.ok) {
        throw new Error(registerData?.detail || "Impossible de créer le compte.");
      }

      const loginRes = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPassword,
        }),
      });

      const loginData = await loginRes.json().catch(() => ({}));

      if (!loginRes.ok) {
        throw new Error(loginData?.detail || "Compte créé, mais connexion automatique impossible.");
      }

      const token =
        loginData?.access_token ||
        loginData?.token ||
        loginData?.user?.access_token ||
        "";

      if (typeof window !== "undefined" && token) {
        window.localStorage.setItem("access_token", token);
        window.localStorage.setItem("lgd_token", token);
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030303] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#f5b700]/10 blur-3xl" />
        <div className="absolute right-[-80px] top-[-40px] h-80 w-80 rounded-full bg-[#f5b700]/8 blur-3xl" />
        <div className="absolute bottom-[-80px] left-1/3 h-72 w-72 rounded-full bg-[#7c3aed]/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,183,0,0.08),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.08),transparent_28%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:42px_42px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-[1280px] flex-col px-6 pb-10 pt-8 md:px-10 lg:px-12">
        <div className="mx-auto mb-8 flex max-w-5xl flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-[28px] border border-[#f5b700]/35 bg-black/55 px-7 py-3 shadow-[0_0_35px_rgba(245,183,0,0.12)] backdrop-blur">
            <div className="text-center">
              <div className="text-5xl font-black tracking-tight text-[#f5b700] md:text-6xl">
                LGD
              </div>
              <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.34em] text-white/85">
                Le Générateur Digital
              </div>
            </div>
          </div>

          <h1 className="max-w-5xl text-[54px] font-black leading-[1.02] tracking-tight text-white md:text-[68px]">
            Ton succès <span className="text-[#f5b700]">commence ici.</span>
          </h1>

          <p className="mt-3 max-w-4xl text-lg leading-8 text-white/78 md:text-[22px]">
            Crée ton compte LGD et construis ton système digital avec l’IA.
          </p>
        </div>

        {error ? (
          <div className="mx-auto mb-6 w-full max-w-4xl rounded-[24px] border border-red-700/50 bg-red-950/40 px-5 py-4 text-center text-base text-red-100">
            {error}
          </div>
        ) : null}

        <div className="mx-auto grid w-full max-w-[1220px] grid-cols-1 gap-8 xl:grid-cols-[0.94fr_1.06fr]">
          <section className="rounded-[34px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-8 shadow-[0_0_30px_rgba(0,0,0,0.45)] backdrop-blur md:p-10">
            <div className="mb-8 flex items-start gap-5">
              <div className="flex h-[84px] w-[84px] items-center justify-center rounded-[24px] border border-[#f5b700]/30 bg-[linear-gradient(180deg,rgba(245,191,33,0.22),rgba(245,191,33,0.06))] text-[34px] text-[#f5b700] shadow-[0_0_24px_rgba(245,183,0,0.15)]">
                <FaUser />
              </div>

              <div>
                <h2 className="text-[38px] font-black leading-none text-white md:text-[48px]">
                  Créer un compte <span className="text-[#f5b700]">LGD</span>
                </h2>
                <p className="mt-3 text-lg text-white/72 md:text-[24px]">
                  Rejoins la communauté et passe à l’action.
                </p>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="group flex items-center gap-4 rounded-[22px] border border-white/14 bg-black/45 px-6 py-5 transition focus-within:border-[#f5b700]/45 focus-within:shadow-[0_0_0_1px_rgba(245,183,0,0.18)]">
                <FaUser className="shrink-0 text-white/45 group-focus-within:text-[#f5b700]" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nom et prénom"
                  className="w-full bg-transparent text-[20px] text-white outline-none placeholder:text-white/45"
                />
              </div>

              <div className="group flex items-center gap-4 rounded-[22px] border border-white/14 bg-black/45 px-6 py-5 transition focus-within:border-[#f5b700]/45 focus-within:shadow-[0_0_0_1px_rgba(245,183,0,0.18)]">
                <FaEnvelope className="shrink-0 text-white/45 group-focus-within:text-[#f5b700]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full bg-transparent text-[20px] text-white outline-none placeholder:text-white/45"
                />
              </div>

              <div className="group flex items-center gap-4 rounded-[22px] border border-white/14 bg-black/45 px-6 py-5 transition focus-within:border-[#f5b700]/45 focus-within:shadow-[0_0_0_1px_rgba(245,183,0,0.18)]">
                <FaLock className="shrink-0 text-white/45 group-focus-within:text-[#f5b700]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe"
                  className="w-full bg-transparent text-[20px] text-white outline-none placeholder:text-white/45"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-white/45 transition hover:text-[#f5b700]"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-[22px] bg-[#f5bf21] px-6 py-5 text-center text-[24px] font-black text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Création..." : "Créer mon compte"}
                <FaArrowRight className="text-lg" />
              </button>
            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-base uppercase tracking-[0.22em] text-white/35">ou</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <p className="text-center text-[22px] text-white/72">
              Déjà un compte ?{" "}
              <Link href="/auth/login" className="font-bold text-[#f5b700] hover:brightness-110">
                Se connecter
              </Link>
            </p>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col items-center rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-5 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white/85">
                  <FaShieldAlt />
                </div>
                <div className="text-[20px] font-semibold text-white">Sécurisé</div>
              </div>

              <div className="flex flex-col items-center rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-5 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white/85">
                  <FaLock />
                </div>
                <div className="text-[20px] font-semibold text-white">Confidentiel</div>
              </div>

              <div className="flex flex-col items-center rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-5 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white/85">
                  <FaUsers />
                </div>
                <div className="text-[20px] font-semibold text-white">Accès immédiat</div>
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[34px] border border-[#f5b700]/35 bg-[linear-gradient(180deg,rgba(245,183,0,0.08),rgba(255,255,255,0.02))] p-8 shadow-[0_0_35px_rgba(245,183,0,0.14)] backdrop-blur md:p-10">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute right-8 top-8 h-48 w-48 rounded-full bg-[#f5b700]/10 blur-3xl" />
              <div className="absolute bottom-8 left-6 h-44 w-44 rounded-full bg-[#7c3aed]/14 blur-3xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,183,0,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.14),transparent_25%)]" />
            </div>

            <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <div className="mb-6 flex flex-wrap items-center gap-4">
                  <div className="flex h-[84px] w-[84px] items-center justify-center rounded-[24px] border border-[#f5b700]/35 bg-black/35 text-[38px] text-[#f5b700] shadow-[0_0_24px_rgba(245,183,0,0.12)]">
                    <FaRocket />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-[42px] font-black leading-none text-white md:text-[58px]">
                      Essai gratuit
                      <span className="mt-2 block text-[#f5b700]">7 jours</span>
                    </h2>
                  </div>

                  <span className="rounded-full border border-[#c084fc]/40 bg-[#4c1d95]/45 px-5 py-2 text-[18px] font-semibold text-white shadow-[0_0_18px_rgba(124,58,237,0.18)]">
                    Sans carte bancaire
                  </span>
                </div>

                <p className="mb-7 max-w-2xl text-[22px] leading-9 text-white/82">
                  Découvre LGD gratuitement pendant 7 jours, sans carte bancaire.
                  Teste les fonctionnalités clés, utilise l’IA et commence à construire
                  ton système digital.
                </p>

                <div className="space-y-4">
                  {[
                    {
                      icon: FaCalendarAlt,
                      title: "7 jours gratuits",
                      text: "Sans engagement, annulation à tout moment.",
                    },
                    {
                      icon: FaCheckCircle,
                      title: "Sans carte bancaire",
                      text: "Aucune information de paiement requise.",
                    },
                    {
                      icon: FaBolt,
                      title: "10 000 jetons IA / jour",
                      text: "Profite d’un quota quotidien pour tester librement.",
                    },
                    {
                      icon: FaBrain,
                      title: "Mémoire LGD activée",
                      text: "Tes projets, contenus et idées sont sauvegardés.",
                    },
                    {
                      icon: FaHeart,
                      title: "Reprise du compte à tout moment",
                      text: "Reviens quand tu veux, on garde tout pour toi.",
                    },
                  ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={index} className="flex items-start gap-4 rounded-[22px] border border-white/10 bg-black/22 px-4 py-4">
                        <div className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-white/12 bg-black/45 text-xl text-[#f5b700]">
                          <Icon />
                        </div>
                        <div>
                          <div className="text-[20px] font-bold text-white">{item.title}</div>
                          <div className="mt-1 text-[17px] leading-7 text-white/68">{item.text}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 rounded-[24px] border border-white/12 bg-black/30 px-5 py-5">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f5b700] text-xl text-black">
                      <FaHeart />
                    </div>
                    <div>
                      <div className="text-[28px] font-black leading-tight text-white">
                        À la fin de ton essai, ton travail <span className="text-[#f5b700]">reste sauvegardé.</span>
                      </div>
                      <p className="mt-2 text-[20px] leading-8 text-white/78">
                        Tu peux revenir à tout moment et activer un plan pour reprendre
                        exactement là où tu t’étais arrêté.
                      </p>
                    </div>
                  </div>
                </div>

                <a
                  href={trialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 flex w-full items-center justify-center gap-3 rounded-[22px] bg-[linear-gradient(90deg,#6d28d9_0%,#f59e0b_55%,#f5bf21_100%)] px-6 py-5 text-center text-[24px] font-black text-white transition hover:brightness-110"
                >
                  Activer mon essai gratuit
                  <FaArrowRight className="text-lg" />
                </a>

                <div className="mt-3 text-center text-[15px] text-white/58">
                  Aucun paiement requis • Annulation à tout moment
                </div>
              </div>

              <div className="relative hidden min-h-[640px] items-center justify-center lg:flex">
                <div className="absolute left-8 top-20 h-44 w-32 rotate-[-16deg] rounded-[22px] border border-[#f5b700]/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] shadow-[0_0_25px_rgba(245,183,0,0.10)]" />
                <div className="absolute left-28 top-44 h-52 w-36 rotate-[8deg] rounded-[22px] border border-[#f5b700]/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.02))] shadow-[0_0_25px_rgba(245,183,0,0.10)]" />
                <div className="absolute right-4 top-28 h-40 w-40 rotate-[12deg] rounded-[22px] border border-[#f5b700]/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-5 shadow-[0_0_28px_rgba(245,183,0,0.12)]">
                  <div className="text-6xl font-black text-[#f5b700]">10K</div>
                  <div className="mt-2 text-lg leading-7 text-white/75">jetons / jour</div>
                </div>

                <div className="relative mt-36 flex h-[360px] w-[320px] items-end justify-center">
                  <div className="absolute inset-x-8 bottom-24 h-28 rounded-full bg-[#f5b700]/25 blur-3xl" />
                  <div className="absolute left-2 right-2 bottom-24 h-24 bg-[linear-gradient(180deg,rgba(245,183,0,0.45),rgba(245,183,0,0.02))] blur-2xl" />

                  <div className="relative h-[250px] w-[220px] rounded-b-[26px] border border-[#f5b700]/25 bg-[linear-gradient(180deg,rgba(18,18,18,0.9),rgba(7,7,7,1))] shadow-[0_0_35px_rgba(245,183,0,0.16)]">
                    <div className="absolute -left-7 top-2 h-20 w-24 origin-right skew-y-[18deg] rounded-l-[10px] border border-[#f5b700]/18 bg-[linear-gradient(180deg,rgba(22,22,22,0.96),rgba(8,8,8,1))]" />
                    <div className="absolute -right-7 top-2 h-20 w-24 origin-left -skew-y-[18deg] rounded-r-[10px] border border-[#f5b700]/18 bg-[linear-gradient(180deg,rgba(22,22,22,0.96),rgba(8,8,8,1))]" />
                    <div className="absolute inset-x-8 top-[-72px] h-28 rounded-[18px] border border-[#f5b700]/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.03))] shadow-[0_0_30px_rgba(245,183,0,0.10)]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-6xl font-black tracking-tight text-[#f5b700]">LGD</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
