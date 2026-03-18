"use client";

import Image from "next/image";

export default function ByLGDWatermark({
  premium = false,
  position = "bottom-right",
  size = 38,
}: {
  premium?: boolean;        // Si true → watermark caché
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  size?: number;            // taille du logo mini
}) {
  if (premium) return null; // On masque si plan Ultimate

  const posClass = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
  }[position];

  return (
    <a
      href="https://legenerateurdigital.fr" // ← ta page de vente ici
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed z-[9999] opacity-90 hover:opacity-100 transition-opacity ${posClass}`}
    >
      {/* Logo mini LGD */}
      <div className="p-1 bg-black/60 rounded-lg border border-yellow-500/30 backdrop-blur-md shadow-lg shadow-yellow-500/10">
        <Image
          src="/lgd-certified-mini.png" // <-- ajoute cette image dans /public
          alt="By LGD"
          width={size}
          height={size}
        />
      </div>
    </a>
  );
}
