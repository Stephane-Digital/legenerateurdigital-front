"use client";

import { useState } from "react";
import CardLuxe from "@/components/ui/CardLuxe";
import { FaImage, FaPalette, FaLayerGroup } from "react-icons/fa";

export default function LeadEnginePage() {
  const [images, setImages] = useState<string[]>([]);
  const [color, setColor] = useState("#ffb800");
  const [structure, setStructure] = useState({
    benefits: true,
    faq: false,
    proof: false,
    urgency: false,
  });

  function toggle(key: keyof typeof structure) {
    setStructure((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleUpload(e: any) {
    const files = Array.from(e.target.files || []);
    const urls = files.map((f: any) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...urls]);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-6 pt-[120px] pb-16">

        <h1 className="text-3xl font-bold text-[#ffb800] text-center">
          Lead Engine V6 — Phase 5.1
        </h1>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-10">

          <div className="flex flex-col gap-6">

            <CardLuxe className="p-6">
              <div className="flex items-center gap-3">
                <FaImage className="text-yellow-400" />
                <h2 className="font-bold text-yellow-400">Médias</h2>
              </div>

              <input type="file" multiple onChange={handleUpload} className="mt-4" />

              <div className="flex gap-2 mt-4 flex-wrap">
                {images.map((img, i) => (
                  <img key={i} src={img} className="w-16 h-16 object-cover rounded" />
                ))}
              </div>
            </CardLuxe>

            <CardLuxe className="p-6">
              <div className="flex items-center gap-3">
                <FaPalette className="text-yellow-400" />
                <h2 className="font-bold text-yellow-400">Branding</h2>
              </div>

              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="mt-4" />
            </CardLuxe>

            <CardLuxe className="p-6">
              <div className="flex items-center gap-3">
                <FaLayerGroup className="text-yellow-400" />
                <h2 className="font-bold text-yellow-400">Structure</h2>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                {Object.keys(structure).map((key) => (
                  <button
                    key={key}
                    onClick={() => toggle(key as any)}
                    className={`p-2 rounded border ${
                      structure[key as keyof typeof structure]
                        ? "bg-yellow-500/20 border-yellow-400"
                        : "border-white/20"
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </CardLuxe>

          </div>

          <div>
            <CardLuxe className="p-6">
              <h2 className="text-yellow-400 font-bold">Preview</h2>

              <div className="mt-4 p-6 rounded bg-[#0b0b0b]">
                <h3 style={{ color }} className="text-xl font-bold">
                  Ton lead magnet
                </h3>

                <p className="mt-2 text-white/70">
                  Une page optimisée selon ta configuration
                </p>

                {structure.benefits && (
                  <div className="mt-4">
                    <h4 className="text-yellow-200">Bénéfices</h4>
                    <ul className="text-sm text-white/70">
                      <li>✔ Génère des leads</li>
                      <li>✔ Convertit mieux</li>
                    </ul>
                  </div>
                )}

                {structure.faq && <div className="mt-4 text-white/70">FAQ activée</div>}
                {structure.proof && <div className="mt-4 text-white/70">Preuve sociale</div>}
                {structure.urgency && <div className="mt-4 text-red-400">Urgence activée</div>}

                <div className="mt-4 flex gap-2">
                  {images.map((img, i) => (
                    <img key={i} src={img} className="w-20 h-20 object-cover rounded" />
                  ))}
                </div>
              </div>
            </CardLuxe>
          </div>

        </div>
      </div>
    </div>
  );
}
