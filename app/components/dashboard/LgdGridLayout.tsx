"use client";

import { ReactNode, useEffect, useState } from "react";

interface LgdGridLayoutProps {
  /** Contenu principal (cartes, boutons, etc.) */
  children: ReactNode;
  /** Nombre de colonnes (3, 4 ou 5 par défaut) */
  columns?: number;
  /** Espace entre colonnes (par défaut 100px) */
  gap?: number;
  /** Titre principal de la section */
  title?: string;
  /** Sous-titres (doré + gris clair) */
  subtitleGold?: string;
  /** Sous-titre complémentaire (gris clair) */
  subtitleGray?: string;
  /** Bouton principal éventuel */
  actionButton?: ReactNode;
}

/**
 * 🌟 LgdGridLayout — Structure visuelle standard LGD.
 * Fournit un cadre harmonisé pour toutes les pages du Dashboard.
 */
export default function LgdGridLayout({
  children,
  columns = 5,
  gap = 100,
  title,
  subtitleGold,
  subtitleGray,
  actionButton,
}: LgdGridLayoutProps) {
  const [isWide, setIsWide] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth >= 1200;
  });

  useEffect(() => {
    const onResize = () => setIsWide(window.innerWidth >= 1200);
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Modèle de colonnes selon la taille
  const getGridTemplate = (cols: number) => {
    const templates: Record<number, string> = {
      3: "1fr 350px 350px 350px 1fr",
      4: "1fr 300px 300px 300px 300px 1fr",
      5: "1fr 350px 350px 350px 1fr",
    };
    return templates[cols] || templates[5];
  };

  return (
    <div className="mt-[-30px] flex w-full flex-col items-center px-4">
      <div className="mt-[80px] flex w-full max-w-[1400px] flex-col items-center space-y-8 text-center">
        {/* === TITRES === */}
        {title && (
          <h1 className="flex items-center justify-center gap-2 text-4xl font-bold text-[#ffb800] drop-shadow-lg">
            {title}
          </h1>
        )}
        {subtitleGold && <p className="mt-1 text-lg text-[#ffb800]">{subtitleGold}</p>}
        {subtitleGray && <p className="mt-1 text-sm text-gray-400">{subtitleGray}</p>}

        {/* === BOUTON PRINCIPAL (optionnel) === */}
        {actionButton && <div className="mt-6 mb-[30px]">{actionButton}</div>}

        {/* === GRILLE RESPONSIVE === */}
        <div
          className="w-full"
          style={
            isWide
              ? {
                  display: "grid",
                  gridTemplateColumns: getGridTemplate(columns),
                  columnGap: `${gap}px`,
                  rowGap: "32px",
                  justifyContent: "center",
                  alignItems: "start",
                }
              : {
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  rowGap: "32px",
                  justifyItems: "center",
                }
          }
        >
          {isWide && <div />} {/* marge gauche */}
          {children}
          {isWide && <div />} {/* marge droite */}
        </div>
      </div>
    </div>
  );
}
