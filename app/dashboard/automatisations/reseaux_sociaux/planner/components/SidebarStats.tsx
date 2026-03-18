"use client";

import { motion } from "framer-motion";

export default function SidebarStats({ posts = [] }: { posts: any[] }) {
  const safePosts = Array.isArray(posts) ? posts : [];

  // Compter les posts du mois
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const monthlyPosts = safePosts.filter((p) => {
    if (!p?.date_programmee) return false;
    const d = new Date(p.date_programmee);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 h-fit shadow-lg"
    >
      <h2 className="text-xl font-bold text-yellow-400 mb-6 tracking-wide">
        Publications du mois
      </h2>

      {/* Nombre total */}
      <div className="mb-8">
        <p className="text-sm text-zinc-400 mb-1">Nombre total :</p>
        <p className="text-3xl font-bold text-yellow-400">
          {monthlyPosts.length}
        </p>
      </div>

      {/* Liste des posts */}
      <div className="space-y-4">
        {monthlyPosts.length === 0 && (
          <p className="text-sm text-zinc-600 italic">
            Aucune publication programmée ce mois-ci.
          </p>
        )}

        {monthlyPosts.slice(0, 10).map((post, i) => (
          <div
            key={i}
            className="bg-zinc-900 border border-yellow-500/20 rounded-xl p-3"
          >
            <p className="text-xs text-yellow-400 mb-1">
              {new Date(post.date_programmee).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="text-sm text-zinc-300">
              {post.contenu?.slice(0, 70) || "Post programmé"}
            </p>
          </div>
        ))}

        {monthlyPosts.length > 10 && (
          <p className="text-xs text-yellow-500 mt-2">
            + {monthlyPosts.length - 10} autres…
          </p>
        )}
      </div>
    </motion.div>
  );
}
