"use client";

import api from "@/lib/api";
import { useEffect, useRef, useState } from "react";

export default function usePlanner() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ mémoire stable (évite wipe sur erreur)
  const lastGoodPosts = useRef<any[]>([]);

  const deletePost = async (postId: number | string) => {
    const id = String(postId);

    setPosts((prev) => prev.filter((p) => String(p?.id) !== id));

    const tryDelete = async (path: string) => {
      const fn = (api as any)?.delete;

      if (typeof fn === "function") {
        return await fn(path);
      }

      const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      const url = base ? `${base}${path}` : path;

      const r = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });

      if (!r.ok) throw new Error(`DELETE ${path} failed (${r.status})`);

      return await r.json().catch(() => ({}));
    };

    try {
      try {
        await tryDelete(`/planner/posts/${id}`);
        return { ok: true };
      } catch {
        await tryDelete(`/planner/${id}`);
        return { ok: true };
      }
    } catch (err) {
      console.error("Erreur suppression planner:", err);
      await fetchPosts();
      return { ok: false };
    }
  };

  const fetchPosts = async () => {
    setLoading(true);

    try {
      const res = await (api as any).get("/planner/posts");
      const data = res?.data ?? res ?? [];

      if (Array.isArray(data)) {
        setPosts(data);
        lastGoodPosts.current = data; // ✅ sauvegarde
      }
    } catch (err) {
      console.error("Erreur chargement planner:", err);

      // ✅ NE PLUS JAMAIS VIDER
      setPosts(lastGoodPosts.current);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    refetch: fetchPosts,
    setPosts,
    deletePost,
  };
}
