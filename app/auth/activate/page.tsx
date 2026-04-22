"use client";

import Link from "next/link";
import { Suspense, FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FaArrowRight,
  FaCheckCircle,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaKey,
  FaLock,
  FaUser,
} from "react-icons/fa";

function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/+$/, "");
}

type PendingAccessResponse = {
  email?: string;
  has_access?: boolean;
  status?: string | null;
  access_type?: string | null;
  plan?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
};

function ActivateAccountInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);
  const initialEmail = useMemo(
    () => (searchParams.get("email") || "").trim().toLowerCase(),
    [searchParams]
  );

  const [email, setEmail] = useState(initialEmail);
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [checking, setChecking] = useState(false);
  const [activating, setActivating] = useState(false);

  const [pendingInfo, setPendingInfo] = useState<PendingAccessResponse | null>(null);
  const [accessChecked, setAccessChecked] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function checkAccess(targetEmail?: string) {
    const cleanEmail = (targetEmail ?? email).trim().toLowerCase();

    setError("");
    setSuccess("");
    setAccessChecked(false);
    setPendingInfo(null);

    if (!cleanEmail) {
      setError("Renseigne l’adresse email utilisée lors de l’achat ou de l’essai.");
      return;
    }

    try {
      setChecking(true);

      const res = await fetch(
        `${apiBaseUrl}/auth/pending-access?email=${encodeURIComponent(cleanEmail)}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data: PendingAccessResponse = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          (data as any)?.detail || "Impossible de vérifier l’accès pour cette adresse email."
        );
      }

      setPendingInfo(data);
      setAccessChecked(true);

      if (!data?.has_access) {
        setError(
          "Aucun accès en attente trouvé pour cette adresse. Utilise exactement l’email de ton achat ou de ton essai LGD."
        );
        return;
      }

      setSuccess("Accès détecté. Tu peux maintenant finaliser ton compte LGD.");
      setEmail(cleanEmail);
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la vérification de l’accès.");
    } finally {
      setChecking(false);
    }
  }

  async function handleActivate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    const cleanPassword = password;

    setError("");
    setSuccess("");

    if (!cleanEmail || !cleanName || !cleanPassword) {
      setError("Merci de remplir le nom, l’email et le mot de passe.");
      return;
    }

    try {
      setActivating(true);

      const registerRes = await fetch(`${apiBaseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPassword,
          full_name: cleanName,
        }),
      });

      const registerData = await registerRes.json().catch(() => ({}));

      if (!registerRes.ok) {
        throw new Error(registerData?.detail || "Impossible d’activer le compte.");
      }

      const loginRes = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPassword,
        }),
      });

      const loginData = await loginRes.json().catch(() => ({}));

      if (!loginRes.ok) {
        throw new Error(
          loginData?.detail || "Compte activé, mais connexion automatique impossible."
        );
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

      setSuccess("Compte activé avec succès. Redirection vers le dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 900);
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue.");
    } finally {
      setActivating(false);
    }
  }

  useEffect(() => {
    if (initialEmail) {
      checkAccess(initialEmail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEmail]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030303] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-[#f5b700]/10 blur-3xl" />
        <div className="absolute right-[-80px] top-[-40px] h-80 w-80 rounded-full bg-[#f5b700]/8 blur-3xl" />
        <div className="absolute bottom-[-90px] right-[8%] h-72 w-72 rounded-full bg-[#7c3aed]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 md:px-8">
        <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-8 shadow-[0_0_35px_rgba(0,0,0,0.45)]">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[20px] border border-[#f5b700]/30 bg-[linear-gradient(180deg,rgba(245,191,33,0.22),rgba(245,191,33,0.06))] text-2xl text-[#f5b700] shadow-[0_0_24px_rgba(245,183,0,0.15)]">
                <FaKey />
              </div>

              <div>
                <h1 className="text-3xl font-black text-white md:text-4xl">
                  Finaliser mon compte <span className="text-[#f5b700]">LGD</span>
                </h1>
                <p className="mt-2 text-white/70">
                  Définis maintenant ton mot de passe pour activer ton accès acheté ou ton essai.
                </p>
              </div>
            </div>

            <form onSubmit={handleActivate} className="space-y-5">
              <div className="group flex items-center gap-3 rounded-[20px] border border-white/14 bg-black/45 px-5 py-4">
                <FaEnvelope className="shrink-0 text-white/45" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email utilisé lors de l’achat ou de l’essai"
                  className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/45"
                />
              </div>

              <button
                type="button"
                onClick={() => checkAccess()}
                disabled={checking}
                className="flex w-full items-center justify-center gap-3 rounded-[18px] border border-[#f5b700]/35 bg-black/30 px-5 py-3 font-bold text-[#f5b700] transition hover:bg-[#f5b700]/8 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {checking ? "Vérification..." : "Vérifier mon accès"}
              </button>

              <div className="group flex items-center gap-3 rounded-[20px] border border-white/14 bg-black/45 px-5 py-4">
                <FaUser className="shrink-0 text-white/45" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nom et prénom"
                  className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/45"
                />
              </div>

              <div className="group flex items-center gap-3 rounded-[20px] border border-white/14 bg-black/45 px-5 py-4">
                <FaLock className="shrink-0 text-white/45" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choisis ton mot de passe LGD"
                  className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/45"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-white/45 transition hover:text-[#f5b700]"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <button
                type="submit"
                disabled={activating}
                className="flex w-full items-center justify-center gap-3 rounded-[20px] bg-[#f5bf21] px-6 py-4 text-center text-xl font-black text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {activating ? "Activation..." : "Activer mon compte"}
                <FaArrowRight className="text-lg" />
              </button>
            </form>

            {error ? (
              <div className="mt-5 rounded-[18px] border border-red-700/40 bg-red-950/35 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="mt-5 rounded-[18px] border border-emerald-700/40 bg-emerald-950/35 px-4 py-3 text-sm text-emerald-100">
                {success}
              </div>
            ) : null}

            <p className="mt-6 text-center text-sm text-white/60">
              Déjà activé ? <Link href="/auth/login" className="font-semibold text-[#f5b700]">Se connecter</Link>
            </p>
          </section>

          <section className="relative overflow-hidden rounded-[30px] border border-[#f5b700]/25 bg-[linear-gradient(180deg,rgba(245,183,0,0.08),rgba(255,255,255,0.02))] p-8 shadow-[0_0_35px_rgba(245,183,0,0.12)]">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute right-8 top-8 h-44 w-44 rounded-full bg-[#f5b700]/10 blur-3xl" />
              <div className="absolute bottom-6 left-6 h-36 w-36 rounded-full bg-[#7c3aed]/10 blur-3xl" />
            </div>

            <div className="relative">
              <h2 className="text-4xl font-black leading-none text-white md:text-5xl">
                Activation <span className="block text-[#f5b700]">ultra simple</span>
              </h2>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-white/80">
                LGD détecte ton achat ou ton essai, puis te laisse créer ton mot de passe
                directement sur la plateforme. Une fois activé, ton plan et tes quotas sont
                appliqués automatiquement.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-4 rounded-[20px] border border-white/10 bg-black/20 px-4 py-4">
                  <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-white/12 bg-black/45 text-[#f5b700]">
                    <FaEnvelope />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">1. Vérifie ton email</div>
                    <div className="mt-1 text-white/65">
                      Utilise exactement l’adresse email renseignée lors de l’achat ou de l’essai.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-[20px] border border-white/10 bg-black/20 px-4 py-4">
                  <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-white/12 bg-black/45 text-[#f5b700]">
                    <FaLock />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">2. Choisis ton mot de passe</div>
                    <div className="mt-1 text-white/65">
                      Ton mot de passe LGD est créé ici, jamais dans Systeme.io.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-[20px] border border-white/10 bg-black/20 px-4 py-4">
                  <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-white/12 bg-black/45 text-[#f5b700]">
                    <FaCheckCircle />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">3. Accès immédiat</div>
                    <div className="mt-1 text-white/65">
                      Ton plan, tes quotas et ton compte sont activés automatiquement.
                    </div>
                  </div>
                </div>
              </div>

              {accessChecked && pendingInfo?.has_access ? (
                <div className="mt-8 rounded-[22px] border border-[#f5b700]/18 bg-[linear-gradient(180deg,rgba(255,186,8,0.08),rgba(255,255,255,0.02))] px-5 py-5">
                  <div className="text-sm uppercase tracking-[0.24em] text-[#f5b700]/85">
                    accès détecté
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-[16px] border border-white/10 bg-black/20 px-4 py-3">
                      <div className="text-white/55">Type d’accès</div>
                      <div className="font-bold text-white">{pendingInfo.access_type || "—"}</div>
                    </div>
                    <div className="rounded-[16px] border border-white/10 bg-black/20 px-4 py-3">
                      <div className="text-white/55">Plan</div>
                      <div className="font-bold text-white">{pendingInfo.plan || "—"}</div>
                    </div>
                    <div className="rounded-[16px] border border-white/10 bg-black/20 px-4 py-3">
                      <div className="text-white/55">Statut</div>
                      <div className="font-bold text-white">{pendingInfo.status || "—"}</div>
                    </div>
                    <div className="rounded-[16px] border border-white/10 bg-black/20 px-4 py-3">
                      <div className="text-white/55">Email</div>
                      <div className="font-bold text-white break-all">{pendingInfo.email || email}</div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function ActivateAccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center">
          Chargement de l’activation LGD...
        </div>
      }
    >
      <ActivateAccountInner />
    </Suspense>
  );
}
