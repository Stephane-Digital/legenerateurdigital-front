"use client";

import LgdCenteredLayout from "@/app/components/dashboard/LgdCenteredLayout";

export default function PricingPage() {
  const tiers = [
    {
      name: "Essai",
      price: "0 €",
      features: ["10 crédits", "Support communautaire"],
      cta: "Commencer",
      href: "/auth",
      status: "Gratuit",
    },
    {
      name: "Pro",
      price: "29 € / mois",
      features: ["Illimité", "Support prioritaire"],
      cta: "Passer Pro",
      href: "/auth",
      status: "Populaire",
    },
  ];

  return (
    <LgdCenteredLayout
      title="💎 Tarifs LGD"
      subtitle="Le Générateur Digital"
      buttonLabel="+ Nouvelle offre"
    >
      {tiers.map((t) => (
        <div
          key={t.name}
          className="flex flex-col items-center justify-center min-w-[300px] max-w-[600px] w-full
                    bg-[#0d2a3b]/90 border border-[#184b6e] rounded-[12px] shadow-lg
                    py-[10px] px-[20px] gap-[15px] text-center
                    hover:shadow-[0_0_15px_rgba(255,184,0,0.25)] transition-all"
        >
          <h3 className="font-semibold text-lg text-[#ffb800]">{t.name}</h3>
          <p className="text-sm text-gray-300">{t.status}</p>
          <p className="text-xl font-bold text-white">{t.price}</p>

          <ul className="text-gray-400 text-sm mb-[10px]">
            {t.features.map((f) => (
              <li key={f}>• {f}</li>
            ))}
          </ul>

          <a
            href={t.href}
            className="btn-luxe-blue w-[130px] py-2 text-sm text-center rounded-md"
          >
            {t.cta}
          </a>
        </div>
      ))}
    </LgdCenteredLayout>
  );
}
