"use client";

import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const SIO_TRIAL_URL =
    process.env.NEXT_PUBLIC_SYSTEMEIO_TRIAL_URL ||
    "https://legenerateurdigital.systeme.io/lgd";

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ========================= */}
        {/* 🔐 FORMULAIRE REGISTER */}
        {/* ========================= */}
        <div className="bg-[#050505] border border-white/10 rounded-2xl p-8">
          <h1 className="text-2xl font-bold mb-6 text-[#f5b700]">
            Créer un compte LGD
          </h1>

          <form className="space-y-4">
            <input
              type="text"
              placeholder="Nom et prénom"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 rounded-xl bg-black border border-white/20"
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-black border border-white/20"
            />

            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-black border border-white/20"
            />

            <button
              type="submit"
              className="w-full bg-[#f5b700] text-black font-bold py-3 rounded-xl"
            >
              Créer mon compte
            </button>
          </form>

          <p className="text-sm text-white/60 mt-4">
            Déjà un compte ?{" "}
            <Link href="/auth/login" className="text-[#f5b700]">
              Se connecter
            </Link>
          </p>
        </div>

        {/* ========================= */}
        {/* 🚀 BLOC ESSAI GRATUIT */}
        {/* ========================= */}
        <div className="bg-[#050505] border border-[#f5b700]/20 rounded-2xl p-8 flex flex-col justify-between">

          <div>
            <h2 className="text-2xl font-bold text-[#f5b700] mb-4">
              Essai gratuit 7 jours
            </h2>

            <p className="text-white/80 mb-6 leading-relaxed">
              Découvre LGD gratuitement pendant 7 jours, sans carte bancaire.
              Teste les fonctionnalités clés, utilise l’IA et commence à construire ton système digital.
            </p>

            <div className="space-y-3 text-sm text-white/70 mb-6">
              <div>✔ 7 jours gratuits</div>
              <div>✔ Sans carte bancaire</div>
              <div>✔ 10 000 jetons IA / jour</div>
              <div>✔ Mémoire LGD activée</div>
              <div>✔ Reprise du compte à tout moment</div>
            </div>

            <p className="text-white/60 text-sm leading-relaxed">
              À la fin de ton essai, ton travail reste sauvegardé.
              Tu peux revenir à tout moment et activer un plan pour reprendre exactement là où tu t’étais arrêté.
            </p>
          </div>

          <div className="mt-8">
            <a
              href={SIO_TRIAL_URL}
              className="block w-full text-center bg-[#f5b700] text-black font-bold py-3 rounded-xl hover:opacity-90 transition"
            >
              Activer mon essai gratuit
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
