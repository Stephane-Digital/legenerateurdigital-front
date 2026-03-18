"use client";

import LgdCenteredLayout from "@/dashboard/LgdCenteredLayout";

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
          className="flex w-full max-w-[600px] min-w-[300px] flex-col items-center justify-center gap-[15px] rounded-[12px] border border-[#184b6e] bg-[#0d2a3b]/90 px-[20px] py-[10px] text-center shadow-lg transition-all hover:shadow-[0_0_15px_rgba(255,184,0,0.25)]"
        >
          <h3 className="text-lg font-semibold text-[#ffb800]">{t.name}</h3>
          <p className="text-sm text-gray-300">{t.status}</p>
          <p className="text-xl font-bold text-white">{t.price}</p>

          <ul className="mb-[10px] text-sm text-gray-400">
            {t.features.map((f) => (
              <li key={f}>• {f}</li>
            ))}
          </ul>

          <a href={t.href} className="btn-luxe-blue w-[130px] rounded-md py-2 text-center text-sm">
            {t.cta}
          </a>
        </div>
      ))}
    </LgdCenteredLayout>
  );
}
