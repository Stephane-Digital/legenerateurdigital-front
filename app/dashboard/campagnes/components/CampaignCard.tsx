"use client";

import { motion } from "framer-motion";
import { ArrowRight, Layers, Mail, Share2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import CampaignStatusBadge from "./CampaignStatusBadge";

type Props = {
  data: {
    id: number;
    titre: string;
    type: string;
    objectif?: string;
    notes?: string;
    status: string;
    auto_launch: boolean;
    created_at: string;
  };
  onDelete: () => void;
};

export default function CampaignCard({ data, onDelete }: Props) {
  const router = useRouter();

  // Icône selon type
  const icon = {
    email: <Mail size={22} className="text-yellow-400" />,
    social: <Share2 size={22} className="text-yellow-400" />,
    sequence: <Layers size={22} className="text-yellow-400" />,
  }[data.type] || <Layers size={22} className="text-yellow-400" />;

  // Navigation vers la page détaillée selon type
  const navigate = () => {
    if (data.type === "email") router.push(`/dashboard/campagnes/email?id=${data.id}`);
    else if (data.type === "social") router.push(`/dashboard/campagnes/social?id=${data.id}`);
    else router.push(`/dashboard/campagnes/sequences?id=${data.id}`);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="
        bg-[#111]
        border border-yellow-400/20
        rounded-2xl
        p-6
        shadow-lg
        hover:shadow-yellow-400/20
        transition-all
        flex flex-col
        justify-between
      "
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="text-lg font-semibold text-yellow-400">{data.titre}</h3>
        </div>
        <CampaignStatusBadge status={data.status} />
      </div>

      {/* OBJECTIF */}
      {data.objectif && (
        <p className="text-sm text-gray-300 mb-4 line-clamp-2">
          {data.objectif}
        </p>
      )}

      {/* DATE */}
      <p className="text-xs text-gray-500 mb-6">
        Créée le : {new Date(data.created_at).toLocaleDateString("fr-FR")}
      </p>

      {/* ACTIONS */}
      <div className="flex justify-between items-center mt-auto">
        <button
          onClick={navigate}
          className="flex items-center gap-2 text-yellow-300 hover:text-yellow-200 transition"
        >
          Ouvrir <ArrowRight size={18} />
        </button>

        <button
          onClick={onDelete}
          className="text-red-400 hover:text-red-300 transition"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </motion.div>
  );
}
