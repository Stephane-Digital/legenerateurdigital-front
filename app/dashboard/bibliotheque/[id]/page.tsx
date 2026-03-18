"use client";

import LibraryViewer from "@/components/library/LibraryViewer";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type LibraryItem = {
  id: number;
  type: string;
  titre: string;
  contenu: string;
  created_at: string;
};

export default function LibraryItemPage() {
  const params = useParams();
  const id = params?.id;

  const [item, setItem] = useState<LibraryItem | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!id) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/library/${id}`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("NOT_FOUND");

      const data = await res.json();
      setItem(data);
    } catch (err) {
      console.error(err);
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  if (!id)
    return <div className="text-center text-red-400 mt-20">❌ Aucun ID fourni.</div>;

  if (loading)
    return (
      <div className="flex justify-center mt-20 text-gray-300">
        <Loader2 className="animate-spin mr-2" /> Chargement...
      </div>
    );

  if (!item)
    return (
      <div className="text-center text-red-400 mt-20">
        ❌ Élément introuvable.
      </div>
    );

  return (
    <div className="min-h-screen pt-[40px] px-6 bg-[#0a0a0a] text-white pb-20">
      {/* RETOUR */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto mb-6"
      >
        <Link
          href="/dashboard/bibliotheque"
          className="text-sm text-yellow-400 hover:text-yellow-300 flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Retour à la bibliothèque
        </Link>
      </motion.div>

      {/* VIEWER */}
      <LibraryViewer item={item} />
    </div>
  );
}
