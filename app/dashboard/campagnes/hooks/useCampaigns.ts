"use client";

import { useCallback, useState } from "react";

export type Campaign = {
  id: number;
  titre: string;
  type: string;
  objectif?: string;
  notes?: string;
  status: string;
  auto_launch: boolean;
  created_at: string;
  updated_at: string;
};

export default function useCampaigns() {
  const [campagnes, setCampagnes] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================
  // CHARGER TOUTES LES CAMPAGNES
  // ============================================
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campaigns`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Erreur chargement campagnes");

      const data = await res.json();
      setCampagnes(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les campagnes.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // CRÉER
  // ============================================
  const create = async (payload: Partial<Campaign>) => {
    try {
      setLoading(true);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campaigns`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erreur création");

      await load();
      return true;

    } catch (err) {
      console.error(err);
      setError("Erreur lors de la création.");
      return false;

    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // SUPPRIMER
  // ============================================
  const remove = async (id: number) => {
    try {
      setLoading(true);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campaigns/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Erreur suppression");

      await load();
      return true;

    } catch (err) {
      console.error(err);
      setError("Erreur lors de la suppression.");
      return false;

    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // METTRE À JOUR
  // ============================================
  const update = async (id: number, payload: Partial<Campaign>) => {
    try {
      setLoading(true);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campaigns/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erreur mise à jour");

      await load();
      return true;

    } catch (err) {
      console.error(err);
      setError("Erreur lors de la mise à jour.");
      return false;

    } finally {
      setLoading(false);
    }
  };

  return {
    campagnes,
    loading,
    error,
    load,
    create,
    remove,
    update,
  };
}
