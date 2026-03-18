"use client";

import { motion } from "framer-motion";

export default function SkeletonLoader({ height = 60 }: { height?: number }) {
  return (
    <motion.div
      className="w-full rounded-xl bg-[#1a1a1a] overflow-hidden relative"
      style={{ height }}
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.6, repeat: Infinity }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#333] to-transparent animate-pulse" />
    </motion.div>
  );
}
