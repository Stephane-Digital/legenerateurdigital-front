"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import CampaignCard from "@/components/campagnes/CampaignCard";
import ModalNouvelleCampagne from "@/components/campagnes/ModalNouvelleCampagne";
import { createCampaign, fetchCampaigns } from "@/services/apiCampaigns";

type Campaign = {
  id: number;
  titre: string;
  type: string;
  objectif?: string;
  status?: string;
  created_at?: string;
};

export default function CampagnesPage() {
  const [items, setItems] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchCampaigns();
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: {
    titre: string;
    type: string;
    objectif: string;
  }) => {
    try {
      setCreating(true);
      const created = await createCampaign(data);
      setItems((prev) => [created, ...prev]);
      setShowModal(false);
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
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
        className="max-w-5xl mx-auto mb-10 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-yellow-400 mb-2">
            Campagnes IA
          </h1>
          <p className="text-gray-300 text-sm max-w-xl">
            Centralisez et pilotez toutes vos campagnes IA : réseaux sociaux,
            emails, tunnels et séquences.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-yellow-500/30 hover:shadow-yellow-400/50 hover:brightness-110 transition"
        >
          + Nouvelle campagne
        </button>
      </motion.div>

      {/* LISTE DES CAMPAGNES */}
      {loading ? (
        <p className="text-center text-gray-400 mt-16">Chargement...</p>
      ) : items.length === 0 ? (
        <p className="text-center text-gray-400 mt-16">
          Aucune campagne pour le moment. Créez votre première campagne IA !
        </p>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-6xl mx-auto pb-20"
        >
          {items.map((c) => (
            <CampaignCard
              key={c.id}
              item={{
                ...c,
                // ✅ FIX TS: CampaignCard attend objectif: string
                objectif: c.objectif ?? "",
              }}
            />
          ))}
        </motion.div>
      )}

      {/* MODAL */}
      <ModalNouvelleCampagne
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreate}
        loading={creating}
      />
    </div>
  );
}
