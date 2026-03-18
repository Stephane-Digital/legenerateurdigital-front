"use client";

import { motion } from "framer-motion";
import { FolderX } from "lucide-react";

export default function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center mt-20 space-y-3"
    >
      <FolderX className="w-10 h-10 text-red-500" />
      <p className="text-gray-400 text-lg">Aucun élément trouvé dans cette catégorie.</p>
    </motion.div>
  );
}
