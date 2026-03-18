"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function FloatingAddButton() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-8 right-8 z-40"
    >
      <Link
        href="#"
        className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-black hover:from-yellow-400 hover:to-yellow-500 shadow-lg shadow-yellow-600/30 w-14 h-14 rounded-full flex items-center justify-center transition-all"
      >
        <Plus className="w-7 h-7" />
      </Link>
    </motion.div>
  );
}
