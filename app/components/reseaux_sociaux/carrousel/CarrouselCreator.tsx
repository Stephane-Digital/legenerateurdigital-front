"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

type Slide = {
  id: number;
  imageUrl: string;
};

export default function CarouselCreator() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/carousels/upload-slide`,
      {
        method: "POST",
        body: formData,
        credentials: "include",
      }
    );

    const data = await res.json();

    setSlides((prev) => [
      ...prev,
      {
        id: Date.now(),
        imageUrl: data.url,
      },
    ]);

    setUploading(false);
  };

  return (
    <div className="w-full text-white">
      <h2 className="text-2xl font-bold mb-6 text-yellow-400">
        Créateur de Carrousel
      </h2>

      {/* UPLOADER */}
      <label className="bg-yellow-500 hover:bg-yellow-400 cursor-pointer px-4 py-2 rounded-md transition">
        {uploading ? "Téléchargement..." : "Téléverser une image"}
        <input type="file" className="hidden" onChange={handleImageUpload} />
      </label>

      {/* PREVIEW */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-6">
        {slides.map((slide) => (
          <motion.div
            key={slide.id}
            className="relative bg-black/40 p-2 rounded-xl border border-yellow-500/30"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Image
              src={slide.imageUrl}
              width={400}
              height={400}
              alt="slide preview"
              className="rounded-md"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
