import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Le Générateur Digital",
  description: "Créez votre compte pour accéder à votre espace personnel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-[#0d2a3b] text-white`}>
        {children}
      </body>
    </html>
  );
}
