"use client";

import { motion } from "framer-motion";

interface LgdCenteredLayoutProps {
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  children: React.ReactNode;
}

export default function LgdCenteredLayout({
  title,
  subtitle,
  buttonLabel,
  children,
}: LgdCenteredLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white px-6 py-12">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        {title && <h1 className="text-4xl font-semibold text-yellow-400 mb-2">{title}</h1>}
        {subtitle && <p className="text-gray-400 text-sm tracking-wide">{subtitle}</p>}
        {buttonLabel && (
          <button
            className="mt-4 px-5 py-2 bg-yellow-500 text-black rounded-xl font-medium hover:bg-yellow-400 transition"
          >
            {buttonLabel}
          </button>
        )}
      </motion.div>

      {/* Contenu (enfants) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
        {children}
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-sm text-gray-500">
        © 2025 <span className="text-yellow-400">Le Générateur Digital</span> — Tous droits réservés.
      </footer>
    </div>
  );
}
