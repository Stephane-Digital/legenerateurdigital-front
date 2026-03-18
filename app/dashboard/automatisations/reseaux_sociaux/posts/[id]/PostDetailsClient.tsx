"use client";

import api from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type AnyObj = Record<string, any>;

function safeJsonParse(value: any) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function normalizeNetworkValue(v: any) {
  const s = String(v ?? "").toLowerCase().trim();
  return s || "";
}

function extractContent(entry: AnyObj) {
  const raw =
    entry?.contenu ??
    entry?.content ??
    entry?.payload?.contenu ??
    entry?.payload?.content ??
    entry?.generated_content ??
    entry?.data ??
    null;

  return safeJsonParse(raw);
}

function extractNetwork(entry: AnyObj, content: AnyObj) {
  const candidates = [
    entry?.reseau,
    entry?.network,
    entry?.platform,
    entry?.payload?.reseau,
    entry?.payload?.network,
    content?.reseau,
    content?.network,
    content?.platform,
    content?.meta?.reseau,
    content?.meta?.network,
    content?.meta?.platform,
  ];

  for (const c of candidates) {
    const v = normalizeNetworkValue(c);
    if (v) return v;
  }
  return "instagram";
}

function extractTitle(entry: AnyObj, content: AnyObj) {
  const candidates = [
    entry?.titre,
    entry?.title,
    entry?.payload?.titre,
    entry?.payload?.title,
    content?.titre,
    content?.title,
    content?.meta?.titre,
    content?.meta?.title,
  ];

  for (const c of candidates) {
    const s = String(c ?? "").trim();
    if (s) return s;
  }
  return "Post";
}

export default function PostDetailsClient({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromPlanner = searchParams.get("from") === "planner";

  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState<AnyObj | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        // ✅ On garde ton flow : si on vient du planner, on récupère dans /planner/posts
        const res = await (api as any).get("/planner/posts");
        const list = (res?.data ?? res ?? []) as AnyObj[];

        const found = Array.isArray(list)
          ? list.find((x) => String(x?.id) === String(id))
          : null;

        if (!found) throw new Error("Entrée introuvable dans le Planner.");

        if (!mounted) return;
        setEntry(found);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Erreur chargement.");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const view = useMemo(() => {
    const e = entry ?? {};
    const content = extractContent(e) as AnyObj;
    const network = extractNetwork(e, content);
    const title = extractTitle(e, content);
    return { network, title };
  }, [entry]);

  const backToPlanner = () => {
    router.push("/dashboard/automatisations/reseaux_sociaux/planner");
  };

  return (
    <div className="min-h-[calc(100vh-120px)] px-6 pt-40 pb-12">
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-3xl border border-white/10 bg-black/40 p-10 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
          <div className="mb-8 flex items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Détails de la publication</h1>
              <div className="mt-1 text-sm text-white/50">
                Réseau • <span className="capitalize">{view.network}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-white/40">ID #{id}</div>
            </div>
          </div>

          {loading ? (
            <div className="text-white/60">Chargement…</div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="text-xs font-semibold text-white/60">Titre</div>
                <div className="mt-1 text-white">{view.title || "—"}</div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => (fromPlanner ? backToPlanner() : router.back())}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10"
                >
                  ← Retour
                </button>

                <button
                  type="button"
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/15"
                  onClick={() => alert("🗑️ Supprimer (à brancher à l’API ensuite).")}
                >
                  Supprimer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
