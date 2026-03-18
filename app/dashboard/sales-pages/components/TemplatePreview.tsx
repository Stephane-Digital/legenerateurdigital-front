"use client";

export default function LivePreview({ html }) {
  return (
    <div className="h-full w-full overflow-y-auto p-6 bg-[#0a0a0a] border-l border-yellow-700/20">
      <div
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
