"use client";

import { motion } from "framer-motion";

interface AutomationCardProps {
  title: string;
  description: string;
}

export default function AutomationCard({ title, description }: AutomationCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className="rounded-2xl border border-yellow-600/40 bg-[#1A1A1A] p-4 text-center shadow-md shadow-yellow-700/20 transition-all duration-300 hover:border-yellow-500 hover:shadow-yellow-500/40"
    >
      <h3 className="mb-2 text-lg font-semibold text-yellow-500">{title}</h3>
      <p className="text-sm text-gray-300">{description}</p>
    </motion.div>
  );
}
