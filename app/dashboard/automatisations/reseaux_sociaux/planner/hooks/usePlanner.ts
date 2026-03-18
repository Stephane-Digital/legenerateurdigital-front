"use client";

import api from "@/lib/api";
import { useEffect, useState } from "react";

export default function usePlanner() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const deletePost = async (postId: number | string) => {
    const id = String(postId);

    // Optimistic UI
    setPosts((prev) => prev.filter((p) => String(p?.id) !== id));

    const tryDelete = async (path: string) => {
      const fn = (api as any)?.delete;
      if (typeof fn === "function") {
        return await fn(path);
      }

      const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      const url = base ? `${base}${path}` : path;
      const r = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!r.ok) throw new Error(`DELETE ${path} failed (${r.status})`);
      return await r.json().catch(() => ({}));
    };

    try {
      // ✅ Endpoint principal (Planner)
      try {
        await tryDelete(`/planner/posts/${id}`);
        return { ok: true };
      } catch {
        // ✅ Compat legacy
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
      // ✅ FIX TS minimal : api wrapper peut ne pas typer .get
      const res = await (api as any).get("/planner/posts");
      const data = res?.data ?? res ?? [];
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur chargement planner:", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    posts,
    loading,
    refetch: fetchPosts,
    setPosts,
    deletePost,
  };
}
