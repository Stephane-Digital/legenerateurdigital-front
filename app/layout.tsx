// app/layout.tsx

import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Le Générateur Digital",
  description: "Automatise ton business facilement",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="bg-gradient-to-b from-[#0a0a0a] to-[#111827] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
