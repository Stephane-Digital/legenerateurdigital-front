"use client";

import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] text-white">
      <div className="card-luxe w-full max-w-[600px] rounded-2xl border border-[#2a2a2a] bg-gradient-to-b from-[#111] to-[#1c1c1c] p-10 text-center shadow-xl">
        {/* === LOGO === */}
        <div className="mb-4 flex justify-center">
          <Image
            src="/images/logo-lgd.png"
            alt="Logo Le Générateur Digital"
            width={140}
            height={140}
            className="mx-auto drop-shadow-[0_0_15px_rgba(255,184,0,0.6)]"
          />
        </div>

        {/* === TITRE PRINCIPAL === */}
        <h1 className="mb-2 bg-gradient-to-r from-[#ffb800] to-[#ff8800] bg-clip-text text-4xl font-extrabold text-transparent">
          Le Générateur Digital
        </h1>

        <p className="mb-8 text-sm text-gray-400">
          Un outil tout-en-un pour booster votre business dans le marketing digital.
        </p>

        {/* === SOUS-TITRE === */}
        <h2 className="mb-6 text-2xl font-bold text-[#ffb800]">
          Le pouvoir du marketing automatisé 🚀
        </h2>

        <p className="mb-10 leading-relaxed text-gray-300">
          Créez, planifiez et pilotez toutes vos campagnes digitales depuis un tableau de bord
          unique. Gagnez du temps, améliorez votre visibilité et maximisez vos ventes.
        </p>

        {/* === BOUTONS === */}
        <div className="flex flex-col items-center gap-4">
          <Link
            href="/auth/login"
            className="btn-luxe w-4/5 rounded-lg py-3 font-semibold transition duration-200"
          >
            Se connecter
          </Link>
          <Link
            href="/auth/register"
            className="btn-blue w-4/5 rounded-lg py-3 font-semibold transition duration-200"
          >
            Créer un compte
          </Link>
        </div>

        <p className="mt-10 text-xs text-gray-500">
          © 2026 Le Générateur Digital — Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
