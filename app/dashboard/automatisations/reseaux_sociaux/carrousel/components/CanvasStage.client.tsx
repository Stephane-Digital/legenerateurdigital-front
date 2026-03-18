"use client";

import dynamic from "next/dynamic";

// ⚠️ Stage et Layer doivent être chargés dynamique sinon crash SSR
const Stage = dynamic(() => import("react-konva").then((mod) => mod.Stage), {
  ssr: false,
});

const Layer = dynamic(() => import("react-konva").then((mod) => mod.Layer), {
  ssr: false,
});

import ImageLayer from "./Layers/ImageLayer";
import TextLayer from "./Layers/TextLayer";
import { LayerData } from "./types";

interface Props {
  background: any;
  layers: LayerData[];
  updateLayer: (id: string, u: Partial<LayerData>) => void;
  deleteLayer: (id: string) => void;
  format: "1080x1350" | "1080x1920" | "1080x1080";
}

export default function CanvasStageClient({
  background,
  layers,
  updateLayer,
  deleteLayer,
  format,
}: Props) {
  const [w, h] = (() => {
    if (format === "1080x1920") return [1080, 1920];
    if (format === "1080x1080") return [1080, 1080];
    return [1080, 1350];
  })();

  return (
    <div className="bg-[#111] border border-yellow-500/20 rounded-xl p-3 shadow-xl">
      <Stage width={w} height={h}>
        <Layer>
          {/* BACKGROUND */}
          {background?.url && (
            <ImageLayer
              id="__bg__"
              type="image"
              url={background.url}
              x={0}
              y={0}
              width={w}
              height={h}
              updateLayer={() => {}}
            />
          )}

          {/* LAYERS */}
          {layers.map((layer) =>
            layer.type === "text" ? (
              <TextLayer key={layer.id} {...layer} updateLayer={updateLayer} />
            ) : (
              <ImageLayer
                key={layer.id}
                {...layer}
                updateLayer={updateLayer}
                deleteLayer={deleteLayer}
              />
            )
          )}
        </Layer>
      </Stage>
    </div>
  );
}
