"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FaLock,
  FaShieldAlt,
  FaUsers,
} from "react-icons/fa";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [logoError, setLogoError] = useState(false);

  const SIO_TRIAL_URL =
    process.env.NEXT_PUBLIC_SYSTEMEIO_TRIAL_URL ||
    "https://legenerateurdigital.systeme.io/lgd";

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-[#f5b700]/10 blur-3xl rounded-full" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-purple-600/10 blur-3xl rounded-full" />

      <div className="text-center mb-10 relative z-10">
        {!logoError ? (
          <img
            src="/logo-lgd.png"
            alt="LGD"
            className="mx-auto mb-4 h-auto w-[220px] md:w-[280px] object-contain"
            onError={() => setLogoError(true)}
          />
        ) : (
          <div className="mx-auto mb-4">
            <div className="text-5xl md:text-6xl font-black tracking-tight text-[#f5b700]">
              LGD
            </div>
            <div className="text-white/85 text-sm md:text-base font-bold tracking-[0.18em] uppercase">
              Le Générateur Digital
            </div>
          </div>
        )}

        <h1 className="text-4xl md:text-5xl font-black">
          Ton succès <span className="text-[#f5b700]">commence ici.</span>
        </h1>

        <p className="text-white/70 mt-3 max-w-xl mx-auto">
          Crée ton compte LGD et construis ton système digital avec l’IA.
        </p>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        <div className="bg-[#050505] border border-white/10 rounded-2xl p-8 backdrop-blur">
          <h2 className="text-2xl font-bold mb-6 text-[#f5b700]">
            Créer un compte LGD
          </h2>

          <form className="space-y-4">
            <input
              type="text"
              placeholder="Nom et prénom"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 rounded-xl bg-black border border-white/20 focus:border-[#f5b700] outline-none"
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-black border border-white/20 focus:border-[#f5b700] outline-none"
            />

            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-black border border-white/20 focus:border-[#f5b700] outline-none"
            />

            <button
              type="submit"
              className="w-full bg-[#f5b700] text-black font-bold py-3 rounded-xl hover:opacity-90 transition shadow-lg shadow-[#f5b700]/20"
            >
              Créer mon compte
            </button>
          </form>

          <p className="text-sm text-white/60 mt-4 text-center">
            Déjà un compte ?{" "}
            <Link href="/auth/login" className="text-[#f5b700] font-semibold">
              Se connecter
            </Link>
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-5 text-center">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/90">
                <FaShieldAlt />
              </div>
              <div className="text-sm md:text-base font-medium text-white/90">
                Sécurisé
              </div>
            </div>

            <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-5 text-center">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/90">
                <FaLock />
              </div>
              <div className="text-sm md:text-base font-medium text-white/90">
                Confidentiel
              </div>
            </div>

            <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-5 text-center">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/90">
                <FaUsers />
              </div>
              <div className="text-sm md:text-base font-medium text-white/90">
                Accès immédiat
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] border border-[#f5b700]/20 rounded-2xl p-8 flex flex-col justify-between shadow-[0_0_40px_rgba(245,183,0,0.15)]">
          <div>
            <h2 className="text-3xl font-black text-[#f5b700] mb-4">
              Essai gratuit 7 jours 🚀
            </h2>

            <p className="text-white/80 mb-6 leading-relaxed">
              Découvre LGD gratuitement pendant 7 jours, sans carte bancaire.
              Teste les fonctionnalités clés et lance ton business avec l’IA.
            </p>

            <div className="space-y-3 text-sm text-white mb-6">
              <div>🗓️ 7 jours gratuits</div>
              <div>💳 Sans carte bancaire</div>
              <div>🎫 10 000 jetons IA / jour</div>
              <div>🧠 Mémoire LGD activée</div>
              <div>⏱️ Reprise du compte à tout moment</div>
            </div>

            <p className="text-white/60 text-sm leading-relaxed">
              💛 À la fin de ton essai, ton travail reste sauvegardé.
              Tu peux revenir à tout moment et activer ton plan Essentielle, Pro , Ultime.
            </p>
          </div>

          <div className="mt-8">
            <a
              href={SIO_TRIAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-gradient-to-r from-purple-600 to-[#f5b700] text-white font-bold py-3 rounded-xl hover:opacity-90 transition"
            >
              Activer mon essai gratuit 🚀
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
