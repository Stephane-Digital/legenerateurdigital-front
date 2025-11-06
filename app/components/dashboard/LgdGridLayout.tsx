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
    <div className="w-full flex flex-col items-center px-4 mt-[-30px]">
      <div className="w-full max-w-[1400px] flex flex-col items-center text-center space-y-8 mt-[80px]">
        {/* === TITRES === */}
        {title && (
          <h1 className="text-4xl font-bold text-[#ffb800] drop-shadow-lg flex items-center justify-center gap-2">
            {title}
          </h1>
        )}
        {subtitleGold && (
          <p className="text-[#ffb800] text-lg mt-1">{subtitleGold}</p>
        )}
        {subtitleGray && (
          <p className="text-gray-400 text-sm mt-1">{subtitleGray}</p>
        )}

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
