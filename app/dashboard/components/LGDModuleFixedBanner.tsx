"use client";

import Image from "next/image";

export default function LGDModuleFixedBanner() {
  return (
<div className="fixed left-[312px] right-6 top-6 z-[2147483645] hidden lg:block">
  <div className="overflow-hidden rounded-[22px] border border-yellow-500/55 bg-[#060606] shadow-[0_0_42px_rgba(255,184,0,0.13)]">
    <Image
      src="/images/bannière-fixe-lgd2.png"
      alt="LGD — Passe à l'action, passe devant"
      width={1920}
      height={240}
      priority
      className="h-[118px] w-full object-cover"
    />
  </div>
</div>
  );
}
