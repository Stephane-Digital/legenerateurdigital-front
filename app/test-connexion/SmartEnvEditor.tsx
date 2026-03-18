"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type EnvVar = {
  key: string;
  value: string;
};

export default function SmartEnvEditor() {
  const [envVars, setEnvVars] = useState<EnvVar[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = "http://127.0.0.1:8000/admin/env";
  const ADMIN_TOKEN = "lgd_admin_1234"; // correspond à ADMIN_API_KEY dans le backend

  // 🔹 Chargement du .env backend
  useEffect(() => {
    const fetchEnv = async () => {
      try {
        const res = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
        });
        const data = await res.json();

        if (data.data) {
          const arr: EnvVar[] = Object.entries(data.data as Record<string, unknown>).map(
            ([key, value]) => ({
              key,
              // ✅ FIX TS: unknown -> string
              value: value == null ? "" : String(value),
            })
          );
          setEnvVars(arr);
        }
      } catch (err) {
        setMessage("❌ Impossible de charger le .env du backend");
      }
    };
    fetchEnv();
  }, []);

  // 🔹 Modification locale d’une variable
  const handleChange = (index: number, newValue: string) => {
    const updated = [...envVars];
    updated[index].value = newValue;
    setEnvVars(updated);
  };

  // 🔹 Sauvegarde vers le backend
  const saveEnv = async (key: string, value: string) => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ADMIN_TOKEN}`,
        },
        body: JSON.stringify({ key, value }),
      });
      const data = await res.json();
      setMessage(data.message || "✅ Variable mise à jour !");
    } catch (err) {
      setMessage("❌ Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl bg-neutral-900 border border-yellow-700/40 rounded-2xl p-6 mt-10 shadow-lg text-white"
    >
      <h2 className="text-2xl font-semibold text-[#ffb800] mb-4 text-center">
        ⚙️ Smart ENV Editor v4.0 — Backend Connected
      </h2>

      <div className="space-y-4">
        {envVars.map((item, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
          >
            <span className="text-sm text-gray-300 w-48">{item.key}</span>
            <input
              type="text"
              value={item.value}
              onChange={(e) => handleChange(index, e.target.value)}
              className="w-full sm:w-96 bg-neutral-800 border border-yellow-600/30 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <button
              onClick={() => saveEnv(item.key, item.value)}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-400 text-black text-sm font-semibold rounded-md hover:scale-[1.03] transition"
            >
              💾 Sauver
            </button>
          </div>
        ))}
      </div>

      {message && (
        <p
          className={`mt-4 text-center ${
            message.startsWith("✅") ? "text-green-400" : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}
    </motion.div>
  );
}
