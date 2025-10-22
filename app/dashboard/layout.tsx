"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Détection mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a2230] text-white flex flex-col">
      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full bg-[#0f2f45]/95 backdrop-blur-md shadow-lg z-50 border-b border-[#173a55]">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between px-7 py-4">
          {/* MENU (Desktop uniquement) */}
          {!isMobile && (
            <nav className="flex justify-center flex-1 gap-[10px] text-[1.1rem] font-medium tracking-wide">
              {[
                { href: "/dashboard/overview", label: "Vue d’ensemble" },
                { href: "/dashboard/automatisations", label: "Automatisations" },
                { href: "/dashboard/clients", label: "Clients" },
                { href: "/dashboard/campagnes", label: "Campagnes" },
                { href: "/dashboard/settings", label: "Paramètres" },
              ].map((link, index, arr) => (
                <div key={link.href} className="flex items-center">
                  <Link
                    href={link.href}
                    className={`px-[40px] py-[20px] rounded-md relative transition-all duration-200 hover:text-[#ffb800] ${
                      pathname === link.href
                        ? "text-[#ffb800] font-semibold"
                        : "text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                  {index < arr.length - 1 && (
                    <span className="text-[#2d4d63] mx-[20px] select-none">|</span>
                  )}
                </div>
              ))}
            </nav>
          )}

          {/* NOM UTILISATEUR À DROITE */}
          <div className="ml-6 whitespace-nowrap font-semibold text-[#ffb800]">
            Stéphane S
          </div>
        </div>
      </header>

      {/* SIDEBAR MOBILE */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.aside
            key="sidebar"
            initial={{ x: -250, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -250, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-60 bg-[#14324b] z-40 p-6 shadow-lg"
          >
            <nav className="flex flex-col gap-4">
              {[
                { href: "/dashboard/overview", label: "Vue d’ensemble" },
                { href: "/dashboard/automatisations", label: "Automatisations" },
                { href: "/dashboard/clients", label: "Clients" },
                { href: "/dashboard/campagnes", label: "Campagnes" },
                { href: "/dashboard/settings", label: "Paramètres" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`hover:text-[#ffb800] transition ${
                    pathname === link.href ? "text-[#ffb800]" : "text-white"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <button
                onClick={() => alert("Déconnexion à venir...")}
                className="mt-6 bg-gradient-to-r from-[#ffb800] to-[#ff6b00] text-[#0a2540] font-bold px-4 py-2 rounded-md hover:opacity-90 transition"
              >
                Déconnexion
              </button>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* CONTENU PRINCIPAL */}
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4 }}
        className="flex-1 p-8 mt-[100px] mb-[20px]" // marge haute réaliste + 20px bas
      >
        {/* TITRE CENTRAL */}
        <div className="text-center mb-[30px]">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#ffb800] to-[#ff6b00] text-transparent bg-clip-text">
            LGD – Le Générateur du Digital
          </h1>
        </div>

        {/* CONTENU DES PAGES */}
        <div className="flex flex-col gap-[15px]">{children}</div>
      </motion.main>
    </div>
  );
}
