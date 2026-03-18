"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { AutoRepair } from "./AutoRepair";
import { analyserErreur } from "./DiagnosticIA";
import SmartEnvEditor from "./SmartEnvEditor";

export default function TestConnexionPage() {
  const [results, setResults] = useState<{ [key: string]: string }>({});
  const [suggestions, setSuggestions] = useState<{ [key: string]: string }>({});
  const [issueType, setIssueType] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const tests = [
    { name: "Backend Local", url: "http://127.0.0.1:8000" },
    { name: "Ping", url: "http://127.0.0.1:8000/test/ping" },
    { name: "Auth Register", url: "http://127.0.0.1:8000/auth/register" },
    { name: "Backend Render", url: "https://legenerateurdigital-backend-m9b5.onrender.com" },
  ];

  const detectIssueType = (err: any): string => {
    const msg = err.message || "";
    if (msg.includes("CORS")) return "CORS";
    if (msg.includes("fetch") || msg.includes("NetworkError")) return "BACKEND";
    if (msg.includes("http://") || msg.includes("127.0.0.1")) return "URL";
    return "OTHER";
  };

  const runTests = async () => {
    setLoading(true);
    const newResults: any = {};
    const newSuggestions: any = {};
    const newTypes: any = {};

    for (const test of tests) {
      try {
        const res = await fetch(test.url, { method: "GET" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        newResults[test.name] = `✅ OK — ${data.message || "Accessible"}`;
        newSuggestions[test.name] = "Tout fonctionne correctement ✅";
        newTypes[test.name] = "OK";
      } catch (err: any) {
        newResults[test.name] = `❌ ${err.message || "Erreur inconnue"}`;
        newSuggestions[test.name] = analyserErreur(err, test.url);
        newTypes[test.name] = detectIssueType(err);
      }
    }

    setResults(newResults);
    setSuggestions(newSuggestions);
    setIssueType(newTypes);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white px-6">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-[#ffb800] mb-6"
      >
        🧠 LGD Connectivity Assistant v3.1 — Smart ENV + Auto-Repair

      </motion.h1>

      <button
        onClick={runTests}
        disabled={loading}
        className="btn-luxe px-6 py-3 mb-8 text-black font-semibold bg-gradient-to-r from-yellow-500 to-amber-400 rounded-xl hover:scale-[1.03] transition"
      >
        {loading ? "Analyse IA en cours..." : "Lancer le diagnostic IA"}
      </button>

      <div className="grid gap-6 md:grid-cols-2 max-w-5xl w-full">
        {Object.entries(results).map(([key, value]) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-2xl border ${
              value.startsWith("✅") ? "border-yellow-600" : "border-red-600"
            } bg-gradient-to-b from-neutral-900 to-neutral-950 text-center shadow-lg hover:shadow-yellow-500/20 transition`}
          >
            <h3 className="text-lg font-semibold text-[#ffb800] mb-2">{key}</h3>
            <p className="text-gray-300 mb-3">{value}</p>
            <p className="text-sm text-gray-400 italic">{suggestions[key]}</p>

            {issueType[key] !== "OK" && <AutoRepair issueType={issueType[key]} />}
          </motion.div>
        ))}

        {Object.keys(results).length === 0 && !loading && (
          <p className="text-gray-400 text-center w-full">
            Appuyez sur le bouton ci-dessus pour commencer les tests ⚙️
          </p>
        )}
      </div>
<SmartEnvEditor />
      <p className="text-xs text-gray-500 mt-10">
        <p className="text-xs text-gray-500 mt-10">
  LGD Connectivity Assistant v3.1 — Diagnostic + Auto-Repair + Smart ENV 🔧
</p>

      </p>
    </div>
  );
}
