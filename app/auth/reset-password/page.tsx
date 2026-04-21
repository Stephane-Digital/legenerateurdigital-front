"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUser } from "@/lib/auth";

function ResetPasswordContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!token || loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, password }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.detail || "Impossible de réinitialiser le mot de passe."
        );
      }

      const email = String(data?.email || "").trim();

      if (!email) {
        throw new Error("Email introuvable après réinitialisation.");
      }

      await loginUser(email, password);

      setDone(true);

      window.setTimeout(() => {
        router.replace("/dashboard");
        router.refresh();
      }, 800);
    } catch (err: any) {
      setError(
        err?.message || "Impossible de réinitialiser le mot de passe."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white px-6">
      <div className="w-full max-w-md rounded-2xl border border-[#C9A14A]/20 bg-[#111111] p-8 shadow-[0_0_30px_rgba(201,161,74,0.08)]">
        <h1 className="mb-4 text-2xl font-semibold tracking-tight text-[#F5E7BE]">
          Nouveau mot de passe
        </h1>

        {done ? (
          <p className="text-green-400">
            Mot de passe mis à jour. Connexion automatique...
          </p>
        ) : (
          <>
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[#C9A14A]/20 bg-[#E9EEF7] px-4 py-3 text-black outline-none transition focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/15"
              disabled={loading}
            />

            {error ? (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <button
              onClick={handleSubmit}
              disabled={loading || !password.trim() || !token}
              className="mt-4 w-full rounded-xl border border-[#D4AF37]/35 bg-gradient-to-r from-[#B8892D] via-[#D4AF37] to-[#B8892D] px-4 py-3 font-semibold text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Validation..." : "Valider"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white px-6">
          Chargement...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

