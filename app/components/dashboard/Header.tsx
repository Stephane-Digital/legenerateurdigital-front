"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/dashboard/overview", label: "Overview" },
    { href: "/dashboard/automatisations", label: "Automatisations" },
    { href: "/dashboard/tools", label: "Outils" },
    { href: "/dashboard/campagnes", label: "Campagnes" },
    { href: "/dashboard/clients", label: "Clients" },
    { href: "/dashboard/formations", label: "Formations" },
    { href: "/dashboard/bibliotheque", label: "Bibliothèque" },
    { href: "/dashboard/settings", label: "Paramètres" },
  ];

  const linkClasses = (path: string) =>
    pathname === path
      ? "text-[var(--lgd-gold)] font-semibold"
      : "text-[#60a5fa] hover:text-[var(--lgd-gold)] transition";

  return (
    <header className="header-fixed">
      <div className="nav-container">
        {/* LOGO */}
        <div className="logo-wrapper">
          <Link href="/dashboard/overview" className="logo">
            ⚡ Le Générateur Digital
          </Link>
        </div>

        {/* NAV DESKTOP */}
        <nav className="desktop-nav">
          <ul>
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClasses(link.href)}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* BURGER MENU (Mobile) */}
        <button
          className="burger md:hidden"
          aria-label="Ouvrir le menu"
          onClick={() => setMenuOpen(true)}
        >
          <Menu size={26} strokeWidth={3} color="#ffb800" />
        </button>
      </div>

      {/* MENU MOBILE */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="mobile-menu z-50"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
            >
              <div className="flex justify-between items-center mb-8">
                <span className="text-[var(--lgd-gold)] font-semibold text-lg">
                  Menu
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Fermer le menu"
                  className="text-gray-200 hover:text-[var(--lgd-gold)]"
                >
                  <X size={28} strokeWidth={3} color="#ffb800" />
                </button>
              </div>

              <nav className="flex flex-col space-y-4">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={linkClasses(link.href)}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

