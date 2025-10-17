// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  // Utilisé pour générer les URLs absolues (OG, canonical, etc.)
  // Ajuste si ton domaine change. On lit d'abord une var d'env pour la prod.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      "https://legenerateurdigital-front.vercel.app"
  ),

  // Template de titre global : "Page | LeGenerateurDigital"
  title: {
    default: "LeGenerateurDigital",
    template: "%s | LeGenerateurDigital",
  },

  description:
    "LeGenerateurDigital — outils, automatisations et tableau de bord pour booster votre activité.",

  // (Optionnel) Quelques métadonnées utiles pour SEO/partage
  alternates: { canonical: "/" },
  openGraph: {
    title: "LeGenerateurDigital",
    description:
      "LeGenerateurDigital — outils, automatisations et tableau de bord pour booster votre activité.",
    url: "/",
    siteName: "LeGenerateurDigital",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LeGenerateurDigital",
    description:
      "LeGenerateurDigital — outils, automatisations et tableau de bord pour booster votre activité.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      {/* Pas de style inline ici : on laisse globals.css gérer le fond/couleurs */}
      <body>{children}</body>
    </html>
  );
}
