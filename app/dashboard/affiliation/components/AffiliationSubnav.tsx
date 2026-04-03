"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AffiliationSubnav() {
  const pathname = usePathname();
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AffiliationSubnav() {
  const pathname = usePathname();

  const linkClasses = (path: string) =>
    `px-4 py-2 rounded-xl transition-all ${
      pathname === path
        ? "bg-yellow-500 text-black font-semibold"
        : "text-white/80 hover:text-yellow-400 hover:bg-yellow-500/10"
    }`;

  return (
    <div className="flex flex-wrap justify-center gap-4 mb-10">
      <Link href="/dashboard/affiliation" className={linkClasses("/dashboard/affiliation")}>
        Aperçu
      </Link>

      <Link href="/dashboard/affiliation/kit" className={linkClasses("/dashboard/affiliation/kit")}>
        Kit Marketing
      </Link>

      <Link href="/dashboard/affiliation/payouts" className={linkClasses("/dashboard/affiliation/payouts")}>
        Paiements
      </Link>

      <Link href="/dashboard/affiliation/terms" className={linkClasses("/dashboard/affiliation/terms")}>
        Conditions
      </Link>
    </div>
  );
}


  const linkClasses = (path: string) =>
    `px-4 py-2 rounded-xl transition-all ${
      pathname === path
        ? "bg-yellow-500 text-black font-semibold"
        : "text-white/80 hover:text-yellow-400 hover:bg-yellow-500/10"
    }`;

  return (
    <div className="flex flex-wrap justify-center gap-4 mb-10">
      <Link href="/dashboard/affiliation" className={linkClasses("/dashboard/affiliation")}>
        Aperçu
      </Link>

      <Link href="/dashboard/affiliation/kit" className={linkClasses("/dashboard/affiliation/kit")}>
        Kit Marketing
      </Link>

      <Link href="/dashboard/affiliation/payouts" className={linkClasses("/dashboard/affiliation/payouts")}>
        Paiements
      </Link>

      <Link href="/dashboard/affiliation/terms" className={linkClasses("/dashboard/affiliation/terms")}>
        Conditions
      </Link>
    </div>
  );
}

