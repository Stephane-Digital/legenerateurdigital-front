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
      className="bg-[#1A1A1A] border border-yellow-600/40 rounded-2xl shadow-md shadow-yellow-700/20 
                 p-4 text-center transition-all duration-300 hover:shadow-yellow-500/40 hover:border-yellow-500"
    >
      <h3 className="text-lg font-semibold text-yellow-500 mb-2">{title}</h3>
      <p className="text-sm text-gray-300">{description}</p>
    </motion.div>
  );
}
