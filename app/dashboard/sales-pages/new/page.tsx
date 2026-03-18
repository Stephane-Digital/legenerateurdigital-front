"use client";

import SalesForm from "@/components/ui/SalesForm";

export default function SalesPageNew() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold text-gold-500 mb-10">
        Nouvelle Page de Vente
      </h1>

      <SalesForm mode="create" />
    </div>
  );
}
