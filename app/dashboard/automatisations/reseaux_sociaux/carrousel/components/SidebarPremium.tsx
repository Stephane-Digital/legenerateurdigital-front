"use client";

import { LayerData } from "./types";

interface SidebarPremiumProps {
  carrousel?: any;
  slides?: any[];
  activeSlide?: any;

  layers: LayerData[];
  background: any;

  addLayer: (l: LayerData) => void;
  updateLayer: (id: string, updates: Partial<LayerData>) => void;
  deleteLayer: (id: string) => void;
  reorderLayers: (from: number, to: number) => void;

  format: string;
  setFormat: (f: any) => void;

  setBackground: (b: any) => void;
}

export default function SidebarPremium({
  layers,
  background,
  addLayer,
  deleteLayer,
  format,
  setFormat,
  setBackground,
}: SidebarPremiumProps) {
  return (
    <div className="
      w-64
      bg-[#080808]
      border-r border-yellow-500/20
      py-8 px-4
      flex flex-col
      gap-8
      rounded-xl
    ">
      {/* ========================== */}
      {/* SECTION : Ajouter du texte */}
      {/* ========================== */}
      <div className="space-y-3">
        <button
          onClick={() =>
            addLayer({
              id: "txt_" + crypto.randomUUID(),
              type: "text",
              x: 200,
              y: 200,
              text: "Votre texte ici",
              fontSize: 64,
              fill: "white",
            })
          }
          className="
            w-full
            bg-yellow-400
            hover:bg-yellow-300
            text-black font-bold
            py-3 px-4
            rounded-lg
            shadow-lg
            hover:shadow-yellow-300/25
            transition
          "
        >
          + Ajouter un texte
        </button>

        {/* Import image */}
        <label className="block w-full cursor-pointer">
          <div
            className="
              w-full
              bg-[#111]
              border border-yellow-400/20
              text-yellow-300
              py-2 px-3
              rounded-lg
              text-center
              hover:border-yellow-300
              hover:bg-[#151515]
              transition
            "
          >
            📁 Importer une image
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                addLayer({
                  id: "img_" + crypto.randomUUID(),
                  type: "image",
                  url: reader.result as string,
                  x: 100,
                  y: 100,
                  width: 600,
                  height: 600,
                });
              };
              reader.readAsDataURL(file);
            }}
          />
        </label>

        {/* Background IA */}
        <button
          className="
            w-full
            bg-[#111]
            border border-yellow-400/20
            text-yellow-300
            py-2 px-3
            rounded-lg
            hover:border-yellow-300
            hover:bg-[#151515]
            transition
          "
        >
          🧠 Background IA
        </button>
      </div>

      {/* ========================== */}
      {/* SECTION : Style Transfer IA */}
      {/* ========================== */}
      <div className="space-y-2">
        <div className="text-yellow-400 font-bold text-sm flex items-center gap-2">
          🎨 Style Transfer IA
        </div>

        <button
          className="
            w-full py-2 bg-yellow-500 text-black font-semibold rounded-lg
            hover:bg-yellow-400 transition
          "
        >
          Premium Black & Gold
        </button>

        <button
          className="
            w-full py-2 bg-[#111] text-yellow-300 border border-yellow-500/20
            rounded-lg hover:border-yellow-300 transition
          "
        >
          Minimal Apple
        </button>

        <button
          className="
            w-full py-2 bg-[#111] text-yellow-300 border border-yellow-500/20
            rounded-lg hover:border-yellow-300 transition
          "
        >
          Bold Marketing
        </button>
      </div>

      {/* ========================== */}
      {/* SECTION : Formats réseaux sociaux */}
      {/* ========================== */}
      <div className="space-y-2">
        <div className="text-yellow-400 font-bold text-sm flex items-center gap-2">
          📱 Format réseaux sociaux
        </div>

        <button
          onClick={() => setFormat("1080x1350")}
          className={`
            w-full py-2 rounded-lg text-sm transition
            ${
              format === "1080x1350"
                ? "bg-yellow-400 text-black font-semibold"
                : "bg-[#111] text-yellow-300 border border-yellow-500/20 hover:border-yellow-300"
            }
          `}
        >
          Instagram (4:5)
        </button>

        <button
          onClick={() => setFormat("1080x1920")}
          className={`
            w-full py-2 rounded-lg text-sm transition
            ${
              format === "1080x1920"
                ? "bg-yellow-400 text-black font-semibold"
                : "bg-[#111] text-yellow-300 border border-yellow-500/20 hover:border-yellow-300"
            }
          `}
        >
          Story (9:16)
        </button>

        <button
          onClick={() => setFormat("1080x1080")}
          className={`
            w-full py-2 rounded-lg text-sm transition
            ${
              format === "1080x1080"
                ? "bg-yellow-400 text-black font-semibold"
                : "bg-[#111] text-yellow-300 border border-yellow-500/20 hover:border-yellow-300"
            }
          `}
        >
          LinkedIn (1:1)
        </button>
      </div>

      {/* ========================== */}
      {/* SECTION : Templates IA */}
      {/* ========================== */}
      <div className="space-y-2">
        <div className="text-yellow-400 font-bold text-sm flex items-center gap-2">
          ✨ Templates IA
        </div>

        <button className="
          w-full py-2 bg-[#111] text-yellow-300
          border border-yellow-500/20
          rounded-lg hover:border-yellow-300
          transition
        ">
          Générer des templates IA
        </button>
      </div>
    </div>
  );
}
