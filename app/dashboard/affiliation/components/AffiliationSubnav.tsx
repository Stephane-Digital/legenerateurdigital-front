"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard/affiliation", label: "Vue d’ensemble" },
  { href: "/dashboard/affiliation/kit", label: "Kit marketing" },
  { href: "/dashboard/affiliation/payouts", label: "Paiements" },
  { href: "/dashboard/affiliation/terms", label: "Conditions" },
];

export default function AffiliationSubnav() {
  const pathname = usePathname();

  return (
    <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/dashboard/affiliation" && pathname?.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300",
              active
                ? "border-yellow-400/70 bg-gradient-to-r from-[#ffb800] to-[#ffcc4d] text-black shadow-lg shadow-yellow-500/20"
                : "border-yellow-700/30 bg-[#0b0b0b] text-yellow-100 hover:border-yellow-500/50 hover:bg-yellow-500/10",
            ].join(" ")}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}


