"use client";

import { motion } from "framer-motion";
import { ArrowLeft, FileSearch, History } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Campaign = {
  id: number;
  titre: string;
  type: string;
  objectif?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
};

export default function HistoriqueCampagnesPage() {
  const [data, setData] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campaigns`, {
        credentials: "include",
      });

      const d = await res.json();

      // On ne garde que celles finalisées
      const filtered = d.filter((c: Campaign) => c.status === "finished");

      setData(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen pt-[40px] px-6 bg-[#0a0a0a] text-white">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto mb-12"
      >
        <Link
          href="/dashboard/campagnes"
          className="text-sm text-yellow-400 hover:text-yellow-300 flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Retour aux campagnes
        </Link>

        <h1 className="text-3xl font-bold text-yellow-400 mt-4 flex items-center gap-3">
          Historique des campagnes
          <History size={26} className="text-yellow-300" />
        </h1>

        <p className="text-gray-300 mt-2">
          Consultez vos campagnes passées, analysées et finalisées.
        </p>
      </motion.div>

      {/* SECTION LISTE */}
      {loading ? (
        <div className="text-center text-gray-400 mt-20">
          Chargement de l’historique...
        </div>
      ) : data.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-400 mt-20"
        >
          <FileSearch size={42} className="mx-auto mb-3 text-yellow-300" />
          <p>Aucune campagne finalisée pour le moment.</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto pb-20"
        >
          {data.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="
                bg-[#111]
                border border-yellow-400/20
                rounded-2xl
                p-5
                shadow-lg
                hover:shadow-yellow-400/20
                transition
              "
            >
              <h3 className="text-lg font-semibold text-yellow-400">
                {c.titre}
              </h3>

              <p className="text-gray-400 text-sm mt-1">
                Type : <span className="text-gray-300">{c.type}</span>
              </p>

              {c.objectif && (
                <p className="text-gray-400 text-sm mt-1">
                  Objectif :{" "}
                  <span className="text-gray-300">{c.objectif}</span>
                </p>
              )}

              <p className="text-green-400 text-sm mt-2 font-semibold">
                ✔ Finalisée
              </p>

              {/* BOUTON */}
              <Link
                href={`/dashboard/campagnes/email?id=${c.id}`}
                className="
                  inline-block
                  mt-4
                  bg-gradient-to-r
                  from-yellow-500
                  to-yellow-300
                  text-black
                  font-semibold
                  px-4 py-2
                  rounded-xl
                  hover:shadow-yellow-400/30
                  transition
                "
              >
                Ouvrir
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
