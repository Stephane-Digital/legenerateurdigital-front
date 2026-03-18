"use client";

import { loginUser } from "@/lib/auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

const LGD_SIGNUP_URL = "https://legenerateurdigital.systeme.io/lgd";

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
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white px-6">
      <div className="w-full max-w-md rounded-2xl border border-[#C9A14A]/20 bg-[#111111] p-8 shadow-[0_0_30px_rgba(201,161,74,0.08)]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#C9A14A]/30 bg-[#151515] text-xl font-semibold text-[#D4AF37]">
            LGD
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-[#F5E7BE]">
            Connexion
          </h1>

          <p className="mt-2 text-sm text-[#D6D6D6]/80">
            Accédez à votre espace Le Générateur Digital
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[#E9D7A5]"
            >
              Adresse email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              className="w-full rounded-xl border border-[#C9A14A]/20 bg-[#E9EEF7] px-4 py-3 text-black outline-none transition focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/15"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-[#E9D7A5]"
            >
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              className="w-full rounded-xl border border-[#C9A14A]/20 bg-[#E9EEF7] px-4 py-3 text-black outline-none transition focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/15"
              disabled={loading}
              required
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl border border-[#D4AF37]/35 bg-gradient-to-r from-[#B8892D] via-[#D4AF37] to-[#B8892D] px-4 py-3 font-semibold text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#D6D6D6]/80">
          <span>Pas encore de compte ? </span>
          <a
            href={LGD_SIGNUP_URL}
            target="_self"
            rel="noopener noreferrer"
            className="font-medium text-[#D4AF37] hover:text-[#F0C75E]"
          >
            Créer un compte
          </a>
        </div>
      </div>
    </div>
  );
}
