"use client";

import { motion } from "framer-motion";

export default function EmailResult({ data }) {
  const exportFile = async (type) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/email-export/export`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type }),
      }
    );

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `email.${type}`;
    a.click();
  };

  return (
    <motion.div
      className="bg-[#111] border border-yellow-600/20 rounded-2xl p-6 shadow-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 className="text-2xl font-bold mb-4">📧 Email généré</h2>

      <h3 className="text-xl font-semibold mb-3 text-yellow-400">
        {data.subject}
      </h3>

      <div
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: data.body }}
      />

      <div className="flex gap-4 mt-6">
        <button
          onClick={() => exportFile("pdf")}
          className="bg-yellow-600 px-4 py-2 rounded-lg text-black"
        >
          Export PDF
        </button>

        <button
          onClick={() => exportFile("docx")}
          className="bg-yellow-600 px-4 py-2 rounded-lg text-black"
        >
          Export DOCX
        </button>

        <button
          onClick={() => exportFile("txt")}
          className="bg-yellow-600 px-4 py-2 rounded-lg text-black"
        >
          Export TXT
        </button>
      </div>
    </motion.div>
  );
}
