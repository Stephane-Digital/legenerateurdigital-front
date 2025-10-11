"use client";
import { useEffect, useState } from "react";
import { getToken, clearToken, api } from "@/app/lib/api";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const r = useRouter();
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = getToken();
    if (!t) {
      r.replace("/auth/login");
      return;
    }
    (async () => {
      try {
        // Exemple d'appel protégé (adapté à ton backend)
        // Si tu n'as pas /me, remplace par un autre endpoint sécurisé
        const data = await api<any>("/me"); 
        setMe(data);
      } catch (e: any) {
        setError("Session invalide. Merci de vous reconnecter.");
      } finally {
        setLoading(false);
      }
    })();
  }, [r]);

  function logout() {
    clearToken();
    r.push("/auth/login");
  }

  if (loading) return <p className="p-6">Chargement...</p>;
  if (error) return (
    <main className="p-6">
      <p className="text-red-500 mb-4">{error}</p>
      <button className="bg-black text-white rounded px-3 py-2" onClick={logout}>
        Se reconnecter
      </button>
    </main>
  );

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <button className="bg-black text-white rounded px-3 py-2" onClick={logout}>
          Se déconnecter
        </button>
      </div>
      <pre className="bg-gray-100 p-3 rounded">
        {JSON.stringify(me ?? { message: "Connecté 👍" }, null, 2)}
      </pre>
    </main>
  );
}
