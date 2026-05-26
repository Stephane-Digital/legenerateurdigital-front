export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fallback = () => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    };

    // ✅ LGD PERSISTENCE FIX
    // Imported visuals must survive refresh / mode switching / archive.
    // Raw phone screenshots can exceed localStorage quotas and silently break
    // draft persistence. We normalize large images before storing them in layers.
    if (typeof window === "undefined" || !file.type.startsWith("image/")) {
      fallback();
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        URL.revokeObjectURL(objectUrl);

        const maxSide = 1800;
        const sourceW = img.naturalWidth || img.width;
        const sourceH = img.naturalHeight || img.height;

        if (!sourceW || !sourceH) {
          fallback();
          return;
        }

        const ratio = Math.min(1, maxSide / Math.max(sourceW, sourceH));
        const targetW = Math.max(1, Math.round(sourceW * ratio));
        const targetH = Math.max(1, Math.round(sourceH * ratio));

        // Small files are already safe.
        if (ratio >= 1 && file.size < 1_200_000) {
          fallback();
          return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          fallback();
          return;
        }

        ctx.drawImage(img, 0, 0, targetW, targetH);

        const mime = file.type === "image/png" && file.size < 1_500_000 ? "image/png" : "image/jpeg";
        const dataUrl = canvas.toDataURL(mime, mime === "image/jpeg" ? 0.88 : undefined);

        if (!dataUrl || !dataUrl.startsWith("data:image/")) {
          fallback();
          return;
        }

        resolve(dataUrl);
      } catch (error) {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch {
          // ignore
        }
        fallback();
      }
    };

    img.onerror = () => {
      try {
        URL.revokeObjectURL(objectUrl);
      } catch {
        // ignore
      }
      fallback();
    };

    img.src = objectUrl;
  });
}
