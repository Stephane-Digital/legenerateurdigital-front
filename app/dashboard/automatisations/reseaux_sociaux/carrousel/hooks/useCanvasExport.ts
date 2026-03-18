"use client";

import { useCallback } from "react";

interface ExportOptions {
  stageRef: any;
  format: "png" | "jpeg";
  quality?: number; // pour JPEG uniquement
  pixelRatio?: number;
}

/**
 * LGD — Export Konva Stage → PNG/JPEG haute résolution
 * Compatible tous formats : carré, vertical, story
 */
export default function useCanvasExport() {
  /**
   * ================================
   *  EXPORT EN IMAGE (blob ou dataURL)
   * ================================
   */
  const exportImage = useCallback(
    ({ stageRef, format, quality = 0.92, pixelRatio = 2 }: ExportOptions) => {
      if (!stageRef?.current) return null;

      const stage = stageRef.current;

      const mimeType =
        format === "png" ? "image/png" : "image/jpeg";

      const uri = stage.toDataURL({
        mimeType,
        quality,
        pixelRatio,
      });

      return uri;
    },
    []
  );

  /**
   * ================================
   *  DOWNLOAD DIRECT
   * ================================
   */
  const downloadImage = useCallback(
    ({
      stageRef,
      filename = "carrousel-lgd",
      format = "png",
      quality = 0.92,
      pixelRatio = 2,
    }: ExportOptions & { filename?: string }) => {
      const uri = exportImage({
        stageRef,
        format,
        quality,
        pixelRatio,
      });

      if (!uri) return;

      const link = document.createElement("a");
      link.download = `${filename}.${format}`;
      link.href = uri;
      link.click();
    },
    [exportImage]
  );

  return {
    exportImage,
    downloadImage,
  };
}
