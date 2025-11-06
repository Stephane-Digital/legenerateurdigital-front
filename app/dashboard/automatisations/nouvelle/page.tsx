"use client";

import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

export default function NouvelleAutomatisationPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-4xl font-bold text-[var(--lgd-gold)] mb-4">
        🧠 Créer une nouvelle automatisation
      </h1>

      <p className="text-gray-400 max-w-xl mb-10">
        Cette section te permettra bientôt de créer des automatisations intelligentes
        en reliant tes outils LGD entre eux. Reste connecté, ça arrive vite !
      </p>

      <Link href="/dashboard/automatisations" className="btn-luxe-blue flex items-center gap-2">
        <ArrowLeft size={18} /> Retour aux automatisations
      </Link>
    </main>
  );
}
