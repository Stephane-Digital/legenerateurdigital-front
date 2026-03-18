"use client";

import { motion } from "framer-motion";

export default function SequenceResult({ items }) {
  const exportSequence = async (type) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/email-export/export-sequence`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, type }),
      }
    );

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `sequence.${type}`;
    a.click();
  };

  return (
    <motion.div
      className="bg-[#111] border border-yellow-600/20 rounded-2xl p-6 shadow-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 className="text-2xl font-bold mb-4">🔥 Séquence générée</h2>

      <div className="flex flex-col gap-8">
        {items.map((mail, i) => (
          <div key={i} className="bg-black/40 p-4 rounded-xl border border-yellow-600/10">
            <h3 className="text-xl font-semibold text-yellow-400 mb-2">
              {mail.subject}
            </h3>

            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: mail.body }}
            />
          </div>
        ))}
      </div>

      {/* EXPORT */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={() => exportSequence("pdf")}
          className="bg-yellow-600 px-4 py-2 rounded-lg text-black"
        >
          Export PDF
        </button>

        <button
          onClick={() => exportSequence("docx")}
          className="bg-yellow-600 px-4 py-2 rounded-lg text-black"
        >
          Export DOCX
        </button>

        <button
          onClick={() => exportSequence("txt")}
          className="bg-yellow-600 px-4 py-2 rounded-lg text-black"
        >
          Export TXT
        </button>
      </div>
    </motion.div>
  );
}
