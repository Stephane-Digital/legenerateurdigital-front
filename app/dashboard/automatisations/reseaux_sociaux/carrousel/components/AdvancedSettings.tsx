"use client";

interface Props {
  slides: number;
  onSlidesChange: (value: number) => void;

  prompt: string;
  onPromptChange: (value: string) => void;
}

export default function AdvancedSettings({
  slides,
  onSlidesChange,
  prompt,
  onPromptChange,
}: Props) {
  return (
    <div className="mt-10 border border-yellow-600/30 bg-black/30 rounded-2xl p-6 shadow-lg shadow-black/40">
      {/* Titre section */}
      <h2 className="text-xl font-bold text-yellow-400 mb-4 border-b border-yellow-600/30 pb-1">
        Paramètres avancés
      </h2>

      {/* SLIDER — NOMBRE DE SLIDES */}
      <div className="mb-8">
        <label className="block mb-2 text-yellow-300 font-semibold">
          Nombre de slides
        </label>

        <input
          type="range"
          min={3}
          max={12}
          value={slides}
          onChange={(e) => onSlidesChange(Number(e.target.value))}
          className="w-full accent-yellow-400"
        />

        <p className="text-yellow-400 font-bold mt-2 text-lg">
          {slides} slide{slides > 1 ? "s" : ""}
        </p>

        <p className="text-gray-400 text-sm mt-1">
          Recommandé : entre 5 et 10 slides pour un maximum d’impact.
        </p>
      </div>

      {/* INSTRUCTIONS PERSONNALISÉES — PROMPT IA */}
      <div className="mb-4">
        <label className="block mb-2 text-yellow-300 font-semibold">
          Instructions personnalisées (IA)
        </label>

        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Ajouter des instructions spécifiques pour affiner le style, l’angle, le ton, les exemples, etc."
          className="
            w-full bg-black/40 border border-yellow-600/40 rounded-xl
            p-4 min-h-[130px] text-white
            focus:ring-2 focus:ring-yellow-400 focus:outline-none
            placeholder-gray-500
            transition-all duration-200
          "
        />

        <p className="text-gray-400 text-sm mt-2 leading-relaxed">
          Exemples :
          <br />– « Ton expert mais accessible, structure simple et actionnable. »
          <br />– « Inclure un hook fort slide 1 + CTA slide finale. »
          <br />– « Illustrations simples, phrases courtes, rythme rapide. »
        </p>
      </div>
    </div>
  );
}
