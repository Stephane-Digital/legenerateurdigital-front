"use client";
import { useEffect, useState } from "react";
import { me, clearToken } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const u = await me();
        if (mounted) setUser(u);
      } catch (e: any) {
        setErr(e.message || "Non connecté");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const logout = () => {
    clearToken();
    router.push("/auth/login");
  };

  if (err) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <div>
          <p>{err}</p>
          <button onClick={() => router.push("/auth/login")}>Se connecter</button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div style={{ display: "grid", gap: 8 }}>
        <h1>Mon compte</h1>
        {!user ? <p>Chargement…</p> : (
          <>
            <p><strong>Nom :</strong> {user?.name ?? "-"}</p>
            <p><strong>Email :</strong> {user?.email ?? "-"}</p>
            <button onClick={logout}>Se déconnecter</button>
          </>
        )}
      </div>
    </main>
  );
}
