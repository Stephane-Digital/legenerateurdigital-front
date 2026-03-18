"use client";

import { useCallback, useMemo, useState } from "react";

import type { LayerData } from "../types/layers";

// ✅ IMPORTANT : on est dans editor/v5/ui, le hook est dans editor/hooks
import useSchedulePlanner, { useSchedulePlanner as useSchedulePlannerNamed } from "../hooks/useSchedulePlanner";

// ✅ ton arbo : editor-intelligent est sibling de carrousel (on remonte 4 niveaux depuis v5/ui)
import SchedulePlannerModal from "../../../../editor-intelligent/SchedulePlannerModal";

import EditorLayout from "./EditorLayout";

type Props = {
  carrousel?: {
    id?: string | number;
    title?: string;
  };

  // ✅ Variante A (ton build actuel dans /carrousel/[id]/page.tsx)
  layers?: LayerData[];
  onChange?: (layers: LayerData[]) => void;

  // ✅ Variante B (ancienne variante)
  initialLayers?: LayerData[];
  setLayers?: (layers: LayerData[]) => void;

  initialUI?: any;
  onUIChange?: (ui: any) => void;
};

export default function CarrouselEditorV5({
  carrousel,
  layers,
  onChange,
  initialLayers,
  setLayers,
  initialUI,
  onUIChange,
}: Props) {
  // ✅ Hook : si named existe, on le préfère, sinon default
  const useSchedulePlannerHook = useSchedulePlannerNamed || (useSchedulePlanner as any);
  const { schedule, loading } = useSchedulePlannerHook();

  // ✅ Source de vérité : si props.layers existe → contrôlé par parent
  const isControlled = Array.isArray(layers) && typeof onChange === "function";

  const [internalLayers, setInternalLayers] = useState<LayerData[]>(() => (initialLayers ?? []) as LayerData[]);
  const effectiveLayers = (isControlled ? (layers as LayerData[]) : internalLayers) as LayerData[];

  const setEffectiveLayers = useCallback(
    (next: LayerData[]) => {
      if (isControlled) {
        onChange?.(next);
        return;
      }
      setInternalLayers(next);
      setLayers?.(next);
    },
    [isControlled, onChange, setLayers]
  );

  // ✅ Modal planner
  const [scheduleOpen, setScheduleOpen] = useState(false);

  // ✅ clé reset quand on change de carrousel
  const initialLayersKey = useMemo(() => {
    const id = carrousel?.id ?? "no-id";
    return `carrousel-v5-${id}`;
  }, [carrousel?.id]);

  const onConfirmSchedule = useCallback(
    async (payload: { reseau: string; date_programmee: string; title?: string }) => {
      const title = payload.title || carrousel?.title || "Carrousel";

      await schedule({
        reseau: payload.reseau,
        date_programmee: payload.date_programmee,
        format: "instagram_carrousel",
        contenu: {
          titre: title,
          draft: null,
          carrousel_id: carrousel?.id ?? null,
          layers: effectiveLayers,
        },
      });

      setScheduleOpen(false);
      alert("✅ Ajouté au Planner !");
    },
    [schedule, carrousel?.id, carrousel?.title, effectiveLayers]
  );

  return (
    <div className="w-full h-full">
      <EditorLayout
        // ⚠️ IMPORTANT : on ne passe PAS "setLayers" ici
        initialLayers={effectiveLayers}
        initialUI={initialUI}
        onUIChange={onUIChange}
        key={initialLayersKey}
      />

      <SchedulePlannerModal
        open={scheduleOpen}
        loading={!!loading}
        defaultTitle={carrousel?.title || "Carrousel"}
        onClose={() => setScheduleOpen(false)}
        // ✅ FIX : SchedulePlannerModal attend UN objet { network, datetimeISO, title }
        onConfirm={(args) =>
          onConfirmSchedule({
            reseau: args.network,
            date_programmee: args.datetimeISO,
            title: args.title,
          })
        }
      />

      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={() => setScheduleOpen(true)}
          disabled={!!loading}
          className="rounded-xl border border-yellow-500/25 bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:opacity-95 disabled:opacity-60"
        >
          {loading ? "Planification..." : "Planifier dans le Planner"}
        </button>
      </div>

      {/* Exemple d’usage interne si tu en as besoin plus tard */}
      {/* <button onClick={() => setEffectiveLayers([...effectiveLayers])}>test</button> */}
    </div>
  );
}
