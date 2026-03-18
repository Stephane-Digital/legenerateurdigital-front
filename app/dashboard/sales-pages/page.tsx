// Ce fichier RESTE un Server Component (donc PAS de "use client")

export const metadata = {
  title: "Pages de Vente IA – Le Générateur Digital",
};

// ✔️ Import d’un Client Component (autorisé dans Next.js 15)
import SalesPagesClient from "./SalesPagesClient";

export default function Page() {
  return <SalesPagesClient />;
}
