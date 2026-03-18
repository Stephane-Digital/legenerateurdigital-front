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
    <div className="mt-[-30px] flex w-full flex-col items-center px-4">
      <div className="mt-[80px] flex w-full max-w-[1400px] flex-col items-center space-y-8 text-center">
        {/* === TITRES === */}
        {title && (
          <h1 className="flex items-center justify-center gap-2 text-4xl font-bold text-[#ffb800]">
            {title}
          </h1>
        )}
        {subtitleGold && <p className="mt-1 text-lg text-[#ffb800]">{subtitleGold}</p>}
        {subtitleGray && <p className="mt-1 text-sm text-gray-400">{subtitleGray}</p>}

        {/* === BOUTON PRINCIPAL === */}
        {actionButton && <div className="mt-6 mb-[30px]">{actionButton}</div>}

        {/* === GRILLE CENTRÉE ADAPTATIVE === */}
        <div
          className="grid w-full items-start justify-center"
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
