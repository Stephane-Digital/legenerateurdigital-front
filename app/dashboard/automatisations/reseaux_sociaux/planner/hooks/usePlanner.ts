"use client";

import api from "@/lib/api";
import { useEffect, useRef, useState } from "react";

function getAuthHeaders() {
  if (typeof window === "undefined") return {};
  const token =
    window.localStorage.getItem("access_token") ||
    window.localStorage.getItem("token") ||
    window.localStorage.getItem("jwt") ||
    window.localStorage.getItem("lgd_token") ||
    "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchSameOriginJson(path: string) {
  const res = await fetch(`/api/proxy${path}`, {
    credentials: "include",
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error(`proxy ${path} failed (${res.status})`);
  return await res.json().catch(() => null);
}

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
      let data: any = null;
      try {
        data = await fetchSameOriginJson("/planner/posts");
      } catch {
        const res = await (api as any).get("/planner/posts");
        data = res?.data ?? res ?? [];
      }

      const safe = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
      setPosts(safe);
      if (safe.length > 0) {
        lastGoodPosts.current = safe;
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
