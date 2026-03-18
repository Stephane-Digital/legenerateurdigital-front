"use client";


const ratios: Record<string, { w: number; h: number }> = {
  "1080x1080": { w: 108, h: 108 }, // carré
  "1080x1350": { w: 108, h: 135 }, // portrait
  "1080x1920": { w: 108, h: 192 }, // story
};

export default function FormatPreview({ format }: { format: string }) {
  const ratio = ratios[format] ?? ratios["1080x1350"];

  return (
    <div className="mt-4">
      <p className="text-yellow-400 text-sm font-semibold mb-2">
        Aperçu du format
      </p>

      <div
        className="border border-yellow-600/40 rounded-lg bg-black mx-auto"
        style={{
          width: ratio.w,
          height: ratio.h,
        }}
      />
    </div>
  );
}
