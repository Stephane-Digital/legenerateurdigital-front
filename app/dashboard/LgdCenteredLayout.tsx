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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-6 py-12 text-white">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center"
      >
        {title && <h1 className="mb-2 text-4xl font-semibold text-yellow-400">{title}</h1>}
        {subtitle && <p className="text-sm tracking-wide text-gray-400">{subtitle}</p>}
        {buttonLabel && (
          <button className="mt-4 rounded-xl bg-yellow-500 px-5 py-2 font-medium text-black transition hover:bg-yellow-400">
            {buttonLabel}
          </button>
        )}
      </motion.div>

      {/* Contenu (enfants) */}
      <div className="grid grid-cols-1 justify-items-center gap-8 md:grid-cols-2">{children}</div>

      {/* Footer */}
      <footer className="mt-16 text-center text-sm text-gray-500">
        © 2025 <span className="text-yellow-400">Le Générateur Digital</span> — Tous droits
        réservés.
      </footer>
    </div>
  );
}
