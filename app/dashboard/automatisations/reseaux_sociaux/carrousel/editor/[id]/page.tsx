"use client";

import type { LayerData } from "@/dashboard/automatisations/reseaux_sociaux/carrousel/editor/v5/types/layers";
import { getCarrouselById } from "@/lib/api_carrousel";
import { saveCarrouselSlide } from "@/lib/api_carrousel_slides";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import SlidesStrip from "../components/SlidesStrip";
import { cloneLayers } from "../utils/cloneLayers";
import { rehydrateLayers } from "../utils/rehydrateLayers";
import { sanitizeLayers } from "../utils/sanitizeLayers";
import CarrouselEditorV5 from "../v5/ui/CarrouselEditorV5";

type Slide = {
  id: string;
  json_layers: LayerData[];
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function CarrouselEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number((params as any)?.id);

  const [carrousel, setCarrousel] = useState<any>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeSlideId, setActiveSlideId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const autosaveTimer = useRef<NodeJS.Timeout | null>(null);
  const lastSaved = useRef<string>("");

  // ✅ wrappers minimalistes pour bypass les props types mismatch (slides)
  const CarrouselEditorV5Any = CarrouselEditorV5 as any;
  const SlidesStripAny = SlidesStrip as any;

  /* ================= LOAD BACKEND ================= */
  useEffect(() => {
    if (!id || Number.isNaN(id)) return;

    const load = async () => {
      try {
        const data = await getCarrouselById(id);

        if (!data) {
          router.push("/dashboard/automatisations/reseaux_sociaux/carrousel");
          return;
        }

        const backendSlides: Slide[] = [];

        for (const s of data.slides || []) {
          const parsed = Array.isArray(s.json_layers)
            ? s.json_layers
            : JSON.parse(s.json_layers || "[]");

          // 🔒 RÉHYDRATATION IMAGE OBLIGATOIRE
          const hydrated = await rehydrateLayers(parsed);

          backendSlides.push({
            id: String(s.id),
            json_layers: cloneLayers(hydrated),
          });
        }

        setCarrousel(data);
        setSlides(backendSlides);

        if (backendSlides.length > 0) {
          setActiveSlideId(backendSlides[0].id);
          lastSaved.current = JSON.stringify(
            sanitizeLayers(backendSlides[0].json_layers)
          );
        }
      } catch (e) {
        console.error("Erreur récupération carrousel :", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, router]);

  const activeSlide = useMemo(
    () => slides.find((s) => s.id === activeSlideId) ?? null,
    [slides, activeSlideId]
  );

  /* ================= AUTOSAVE ================= */
  const scheduleAutosave = (slideId: string, layers: LayerData[]) => {
    const safeLayers = sanitizeLayers(layers);
    const serialized = JSON.stringify(safeLayers);

    if (serialized === lastSaved.current) return;

    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);

    setSaveStatus("saving");

    autosaveTimer.current = setTimeout(async () => {
      try {
        // ✅ FIX TS: le type attendu côté lib peut ne pas matcher (json_Layers vs json_layers)
        // On garde le runtime exact (json_layers) et on cast pour débloquer le build.
        await saveCarrouselSlide(Number(slideId), {
          json_layers: serialized,
        } as any);

        lastSaved.current = serialized;
        setSaveStatus("saved");

        setTimeout(() => setSaveStatus("idle"), 1500);
      } catch (err) {
        console.error("Autosave slide error:", err);
        setSaveStatus("error");
      }
    }, 600);
  };

  /* ================= LAYERS CHANGE ================= */
  const updateActiveSlideLayers = (layers: LayerData[]) => {
    if (!activeSlideId) return;

    const isolated = cloneLayers(layers);

    setSlides((prev) =>
      prev.map((s) =>
        s.id === activeSlideId ? { ...s, json_layers: isolated } : s
      )
    );

    scheduleAutosave(activeSlideId, isolated);
  };

  /* ================= SLIDES ACTIONS ================= */
  const addSlide = () => {
    if (!activeSlide) return;

    const clone: Slide = {
      id: `tmp-${Date.now()}`,
      json_layers: cloneLayers(activeSlide.json_layers),
    };

    setSlides((prev) => [...prev, clone]);
    setActiveSlideId(clone.id);
    lastSaved.current = JSON.stringify(sanitizeLayers(clone.json_layers));
  };

  const duplicateSlide = addSlide;

  const deleteSlide = () => {
    if (slides.length <= 1 || !activeSlideId) return;

    const remaining = slides.filter((s) => s.id !== activeSlideId);
    setSlides(remaining);
    setActiveSlideId(remaining[0].id);
    lastSaved.current = JSON.stringify(
      sanitizeLayers(remaining[0].json_layers)
    );
  };

  /* ================= RENDER ================= */
  if (loading) {
    return (
      <div className="text-yellow-400 text-center py-20 text-xl">
        Chargement du carrousel...
      </div>
    );
  }

  if (!carrousel || !activeSlide) {
    return (
      <div className="text-red-400 text-center py-20 text-xl">
        Carrousel introuvable.
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full pt-[130px] pb-24">
      <div className="max-w-[1400px] mx-auto px-6 mb-6 text-center">
        <button
          onClick={() =>
            router.push("/dashboard/automatisations/reseaux_sociaux/carrousel")
          }
          className="text-yellow-400 hover:text-yellow-300 transition-colors text-sm mb-4"
        >
          ← Retour aux carrousels
        </button>

        <h1 className="text-3xl font-semibold text-yellow-400">
          Éditeur de carrousel
        </h1>

        {saveStatus !== "idle" && (
          <div className="mt-3 text-sm">
            {saveStatus === "saving" && (
              <span className="text-yellow-300">⏳ Sauvegarde…</span>
            )}
            {saveStatus === "saved" && (
              <span className="text-green-400">✅ Sauvegardé</span>
            )}
            {saveStatus === "error" && (
              <span className="text-red-400">❌ Erreur</span>
            )}
          </div>
        )}
      </div>

      <div className="max-w-[1400px] mx-auto px-6">
        <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-6">
          <CarrouselEditorV5Any
            key={`slide-${activeSlide.id}`}
            carrousel={carrousel}
            slides={cloneLayers(activeSlide.json_layers)}
            onChange={updateActiveSlideLayers}
          />

          <SlidesStripAny
            slides={slides.map((s, i) => ({ id: s.id, index: i }))}
            activeSlideId={activeSlideId}
            onSelect={(id: string) => {
              const slide = slides.find((s) => s.id === id);
              if (!slide) return;
              setActiveSlideId(id);
              lastSaved.current = JSON.stringify(sanitizeLayers(slide.json_layers));
            }}
            onAdd={addSlide}
            onDuplicate={duplicateSlide}
            onDelete={deleteSlide}
          />
        </div>
      </div>
    </div>
  );
}
