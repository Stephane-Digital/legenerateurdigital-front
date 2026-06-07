"use client";

import Image from "next/image";

export default function LGDModuleFixedBanner() {
  return (
    <div className="mx-auto mb-6 w-full max-w-[1280px] px-0 sm:px-2">
      <div className="overflow-hidden rounded-[22px] border border-yellow-500/55 bg-[#060606] shadow-[0_0_42px_rgba(255,184,0,0.13)]">
        <Image
          src="/bannière-fixe-lgd2.png"
          alt="LGD — Passe à l'action, passe devant"
          width={1920}
          height={240}
          priority
          className="h-[92px] w-full object-cover sm:h-[110px] lg:h-[118px]"
        />
      </div>
    </div>
  );
}
