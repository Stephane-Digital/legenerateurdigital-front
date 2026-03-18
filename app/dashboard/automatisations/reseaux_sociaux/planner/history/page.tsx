"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SocialLog = {
  id: number;
  platform: string;
  content: string;
  scheduled_for: string;
  posted_at: string | null;
};

export default function HistoryPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<SocialLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/social-logs`,
          {
            method: "GET",
            credentials: "include", // 🔥 OBLIGATOIRE POUR ENVOYER LE COOKIE
          }
        );

        if (res.status === 401) {
          router.push("/auth/login");
          return;
        }

        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error("Erreur chargement logs :", err);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  return (
    <div className="min-h-screen w-full text-white px-6 pb-24">
      <div className="max-w-5xl mx-auto mt-6">
        <button
          onClick={() =>
            router.push("/dashboard/automatisations/reseaux_sociaux/planner")
          }
          className="text-yellow-400 hover:text-yellow-300 transition"
        >
          ← Retour au planning
        </button>
      </div>

      <h1 className="text-center text-3xl font-bold text-yellow-400 mt-8">
        Historique des publications
      </h1>

      <div className="max-w-4xl mx-auto mt-10">
        {loading ? (
          <p className="text-center text-gray-400">Chargement...</p>
        ) : logs.length === 0 ? (
          <p className="text-center text-gray-500">
            Aucun historique enregistré.
          </p>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="border border-yellow-700/30 bg-black/40 p-4 rounded-xl"
              >
                <p className="text-yellow-300 font-semibold">
                  📌 {log.platform}
                </p>
                <p className="text-sm text-gray-300 mt-2">{log.content}</p>

                <p className="text-xs text-gray-400 mt-3">
                  📅 Programmée pour :{" "}
                  {new Date(log.scheduled_for).toLocaleString()}
                </p>

                <p className="text-xs text-gray-500">
                  {log.posted_at
                    ? "✔️ Publié le : " +
                      new Date(log.posted_at).toLocaleString()
                    : "⏳ En attente de publication"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
