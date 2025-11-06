"use client";

import { ReactNode, useEffect, useState } from "react";

interface LgdGridLayoutProps {
  children: ReactNode;
  title?: string;
  subtitleGold?: string;
  subtitleGray?: string;
  actionButton?: ReactNode;
  gap?: number;
}

export default function LgdGridLayout({
  children,
  title,
  subtitleGold,
  subtitleGray,
  actionButton,
  gap = 80,
}: LgdGridLayoutProps) {
  const [columns, setColumns] = useState<number>(3);

  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth >= 1400) setColumns(3);
      else if (window.innerWidth >= 900) setColumns(2);
      else setColumns(1);
    };
    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  return (
    <div className="w-full flex flex-col items-center mt-[-30px] px-4">
      <div className="w-full max-w-[1400px] flex flex-col items-center text-center space-y-8 mt-[80px]">
        {/* === TITRES === */}
        {title && (
          <h1 className="text-4xl font-bold text-[#ffb800] flex items-center justify-center gap-2">
            {title}
          </h1>
        )}
        {subtitleGold && (
          <p className="text-[#ffb800] text-lg mt-1">{subtitleGold}</p>
        )}
        {subtitleGray && (
          <p className="text-gray-400 text-sm mt-1">{subtitleGray}</p>
        )}

        {/* === BOUTON PRINCIPAL === */}
        {actionButton && <div className="mt-6 mb-[30px]">{actionButton}</div>}

        {/* === GRILLE CENTRÉE ADAPTATIVE === */}
        <div
          className="grid justify-center items-start w-full"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, minmax(320px, 1fr))`,
            justifyContent: "center",
            gap: `${gap}px`,
            rowGap: "50px",
            justifyItems: "center",
            alignItems: "start",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
