"use client";

import { loginUser } from "@/lib/auth";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

function sanitizeNext(next: string | null): string {
  const raw = String(next || "").trim();
  if (!raw) return "/dashboard";
  if (!raw.startsWith("/")) return "/dashboard";
  if (raw.startsWith("//")) return "/dashboard";
  return raw;
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const targetAfterLogin = useMemo(
    () => sanitizeNext(searchParams.get("next")),
    [searchParams]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
      <form
        action="#"
        method="post"
        noValidate
        className="bg-[#111] p-10 rounded-xl border border-yellow-600/40 shadow-lg w-full max-w-md"
        onSubmit={async (e) => {
          e.preventDefault();
          e.stopPropagation();

          setLoading(true);
          setError("");

          const form = e.currentTarget;
          const formData = new FormData(form);

          const email = String(formData.get("email") || "").trim();
          const password = String(formData.get("password") || "");

          try {
            await loginUser(email, password);
            window.location.href = targetAfterLogin;
          } catch (err: any) {
            setError(err?.message || "Erreur de connexion");
          } finally {
            setLoading(false);
          }
        }}
      >
        <h1 className="text-3xl font-bold text-center mb-8 text-yellow-400">
          Connexion
        </h1>

        {error && <p className="text-red-400 text-center mb-4 break-words">{error}</p>}

        <div className="flex flex-col gap-5">
          <div>
            <label className="text-sm mb-1 block text-gray-300">Email</label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
              required
            />
          </div>

          <div>
            <label className="text-sm mb-1 block text-gray-300">Mot de passe</label>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full py-3 bg-gradient-to-r from-yellow-600 to-yellow-400 text-black font-semibold rounded-lg shadow-md hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </div>
      </form>
    </div>
  );
}
