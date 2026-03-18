"use client";

import ProtectedPage from "@/components/auth/ProtectedPage";
import { useEffect, useState } from "react";

type SocialLog = {
  id: number;
  post_id: number;
  status: string;
  action: string;
  provider?: string | null;
  message?: string | null;
  created_at: string;
};

export default function SocialHistoryPage() {
  const [logs, setLogs] = useState<SocialLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await fetch("/api/social-logs", { method: "GET" });
        if (!res.ok) {
          console.error("Erreur chargement logs", await res.text());
          return;
        }
        const data = await res.json();
        setLogs(data);
      } catch (e) {
        console.error("Erreur réseau logs", e);
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, []);

  return (
    <ProtectedPage>
      <div className="min-h-screen w-full text-white px-6 pb-24">
        <div className="max-w-5xl mx-auto mt-10">
          <h1 className="text-3xl font-bold mb-6">
            Historique des publications
          </h1>

          {loading ? (
            <div>Chargement...</div>
          ) : logs.length === 0 ? (
            <div className="text-gray-400">
              Aucun log de publication pour le moment.
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-[#111] border border-yellow-500/40 rounded-xl p-4 text-sm"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold">
                      Post #{log.post_id} · {log.action}
                    </span>
                    <span className="text-xs uppercase text-yellow-400">
                      {log.status}
                    </span>
                  </div>
                  <div className="text-gray-400 text-xs mb-1">
                    {log.provider || "Plateforme inconnue"} •{" "}
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                  {log.message && (
                    <div className="text-gray-300">{log.message}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedPage>
  );
}
