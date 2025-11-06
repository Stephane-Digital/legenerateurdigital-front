"use client";

import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] text-white">
      <div className="card-luxe w-full max-w-[600px] p-10 rounded-2xl shadow-xl bg-gradient-to-b from-[#111] to-[#1c1c1c] border border-[#2a2a2a] text-center">

        {/* === LOGO === */}
        <div className="flex justify-center mb-4">
          <Image
            src="/images/logo-lgd.png"
            alt="Logo Le Générateur Digital"
            width={140}
            height={140}
            className="mx-auto drop-shadow-[0_0_15px_rgba(255,184,0,0.6)]"
          />
        </div>

        {/* === TITRE PRINCIPAL === */}
        <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-[#ffb800] to-[#ff8800] bg-clip-text text-transparent">
          Le Générateur Digital
        </h1>

        <p className="text-gray-400 text-sm mb-8">
          Un outil tout-en-un pour booster votre business dans le marketing digital.
        </p>

        {/* === SOUS-TITRE === */}
        <h2 className="text-2xl font-bold mb-6 text-[#ffb800]">
          Le pouvoir du marketing automatisé 🚀
        </h2>

        <p className="text-gray-300 mb-10 leading-relaxed">
          Créez, planifiez et pilotez toutes vos campagnes digitales depuis un
          tableau de bord unique. Gagnez du temps, améliorez votre visibilité et
          maximisez vos ventes.
        </p>

        {/* === BOUTONS === */}
        <div className="flex flex-col items-center gap-4">
          <Link href="/auth/login" className="btn-luxe w-4/5 py-3 font-semibold rounded-lg transition duration-200">
            Se connecter
          </Link>
          <Link
            href="/auth/register"
            className="btn-blue w-4/5 py-3 font-semibold rounded-lg transition duration-200"
          >
            Créer un compte
          </Link>
        </div>

        <p className="text-gray-500 text-xs mt-10">
          © 2025 Le Générateur Digital — Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
