"use client";

import Link from "next/link";
import { BarChart3 } from "lucide-react";

export default function EmailAnalyticsButton() {
  return (
    <Link
      href="/dashboard/email-campaigns/analytics"
      className="inline-flex items-center gap-2 rounded-xl border border-[#7a5c16]/60 bg-[#111111] px-4 py-2 text-sm font-medium text-[#f2d27a] transition hover:border-[#c8a64d] hover:bg-[#161616]"
    >
      <BarChart3 className="h-4 w-4" />
      Voir les analytics
    </Link>
  );
}
