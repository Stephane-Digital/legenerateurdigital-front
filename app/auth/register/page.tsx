"use client";

import { useEffect } from "react";

const LGD_SIGNUP_URL = "https://legenerateurdigital.systeme.io/lgd";

export default function RegisterPage() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.replace(LGD_SIGNUP_URL);
    }, 4200); // rapide mais laisse apparaître le branding

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white px-6">
      <div className="w-full max-w-md rounded-2xl border border-[#C9A14A]/20 bg-[#111111] p-8 text-center shadow-[0_0_30px_rgba(201,161,74,0.08)]">

        {/* Logo LGD */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#C9A14A]/30 bg-[#151515] text-xl font-bold text-[#D4AF37]">
          LGD
        </div>

        {/* Titre */}
        <h1 className="text-2xl font-semibold text-[#F5E7BE]">
          Accès à LGD
        </h1>

        {/* Message */}
        <p className="mt-3 text-sm text-[#D6D6D6]/80 leading-relaxed">
          L’accès à LGD se fait via l’offre officielle.
          <br />
          Redirection en cours…
        </p>

        {/* Loader premium */}
        <div className="mt-6 flex justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin" />
        </div>

      </div>
    </div>
  );
}
