"use client";

import { useEffect, useRef } from "react";
import { Transformer } from "react-konva";
import { LayerData } from "../typesV5";

interface Props {
  selectedLayer: LayerData | null;
  stageRef: any;
}

export default function TransformManager({ selectedLayer, stageRef }: Props) {
  const transformerRef = useRef<any>();

  useEffect(() => {
    if (!transformerRef.current || !stageRef?.current) return;

    const layer = stageRef.current.findOne(`#layer-${selectedLayer?.id}`);

    if (layer) {
      transformerRef.current.nodes([layer]);
      transformerRef.current.getLayer().batchDraw();
    } else {
      transformerRef.current.nodes([]);
    }
  }, [selectedLayer, stageRef]);

  return (
    <Transformer
      ref={transformerRef}
      rotateEnabled={true}
      resizeEnabled={true}
      anchorCornerRadius={8}
      anchorSize={12}
      borderStroke="gold"
      anchorFill="gold"
      anchorStroke="white"
      keepRatio={false}
      enabledAnchors={[
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
        "middle-left",
        "middle-right",
        "top-center",
        "bottom-center",
      ]}
    />
  );
}
