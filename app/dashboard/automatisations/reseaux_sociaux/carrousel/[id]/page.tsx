"use client";

import { getCarrouselById } from "@/lib/api_carrousel";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CarrouselEditorV5 from "../editor/v5/ui/CarrouselEditorV5";

export default function CarrouselEditorPage() {
  const params = useParams();
  const router = useRouter();

  const id = Number((params as any)?.id);

  const [carrousel, setCarrousel] = useState<any>(null);
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ requis par CarrouselEditorV5 (Props: layers + onChange)
  const [layers, setLayers] = useState<any[]>([]);

  useEffect(() => {
    if (!id || Number.isNaN(id)) return;

    const load = async () => {
      try {
        const data = await getCarrouselById(id);

        if (!data) {
          router.push("/dashboard/automatisations/reseaux_sociaux/carrousel");
          return;
        }

        setCarrousel(data);
        const loadedSlides = data.slides || [];
        setSlides(loadedSlides);

        // ✅ init layers depuis la slide 0 si dispo
        if (loadedSlides.length > 0) {
          try {
            const raw = loadedSlides[0]?.json_layers ?? "[]";
            const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
            setLayers(Array.isArray(parsed) ? parsed : []);
          } catch {
            setLayers([]);
          }
        } else {
          setLayers([]);
        }
      } catch (e) {
        console.error("Erreur récupération carrousel :", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, router]);

  if (loading) {
    return (
      <div className="text-yellow-400 text-center py-20 text-xl">
        Chargement du carrousel...
      </div>
    );
  }

  if (!carrousel) {
    return (
      <div className="text-red-400 text-center py-20 text-xl">
        Carrousel introuvable.
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-4 pb-24">
      {/* 🔥 ESPACE SOUS LE HEADER GLOBAL */}
      <div className="h-[100px]" />

      {/* ← RETOUR AUX SLIDES */}
      <div className="max-w-[1800px] mx-auto mb-6">
        <button
          onClick={() =>
            router.push("/dashboard/automatisations/reseaux_sociaux/carrousel")
          }
          className="text-yellow-400 hover:text-yellow-300 transition-colors text-sm"
        >
          ← Retour aux carrousels
        </button>
      </div>

      {/* CONTENU ÉDITEUR RESPONSIVE */}
      <div className="w-full max-w-[1800px] mx-auto">
        <CarrouselEditorV5
          carrousel={carrousel}
          layers={layers}
          onChange={setLayers}
        />
      </div>
    </div>
  );
}
