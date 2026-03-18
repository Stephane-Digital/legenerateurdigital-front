"use client";

import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

export default function NouvelleAutomatisationPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="mb-4 text-4xl font-bold text-[var(--lgd-gold)]">
        🧠 Créer une nouvelle automatisation
      </h1>

      <p className="mb-10 max-w-xl text-gray-400">
        Cette section te permettra bientôt de créer des automatisations intelligentes en reliant tes
        outils LGD entre eux. Reste connecté, ça arrive vite !
      </p>

      <Link href="/dashboard/automatisations" className="btn-luxe-blue flex items-center gap-2">
        <ArrowLeft size={18} /> Retour aux automatisations
      </Link>
    </main>
  );
}
