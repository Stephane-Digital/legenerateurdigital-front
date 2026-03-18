"use client";

// ============================================================
// useAuthGuard — LGD v2025
// Protège une page en vérifiant si le user est authentifié.
// ============================================================

import { me } from "@/lib/auth"; // ✅ Chemin corrigé
import { useEffect, useState } from "react";

export function useAuthGuard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      try {
        const u = await me();

        if (!u || !u.id) {
          window.location.href = "/auth/login";
          return;
        }

        setUser(u);
      } catch (err) {
        console.warn("useAuthGuard(): accès non autorisé", err);
        window.location.href = "/auth/login";
      } finally {
        setLoading(false);
      }
    }

    check();
  }, []);

  return { user, loading };
}
