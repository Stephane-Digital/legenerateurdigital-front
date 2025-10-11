"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [status, setStatus] = useState<"checking" | "ok" | "fail">("checking");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      if (!apiBase) {
        setStatus("fail");
        setMsg("NEXT_PUBLIC_API_BASE_URL manquant.");
        return;
      }
      try {
        const r = await fetch(`${apiBase}/health`, { cache: "no-store" });
        if (r.ok) {
          setStatus("ok");
          setMsg("API joignable ✅");
        } else {
          setStatus("fail");
          setMsg(`API a répondu ${r.status}`);
        }
      } catch (e: any) {
        setStatus("fail");
        setMsg(e?.message ?? "Erreur réseau");
      }
    })();
  }, [apiBase]);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Le Générateur Digital</h1>
      <section
        style={{
          border: "1px solid #333",
          borderRadius: 10,
          padding: 16,
          maxWidth: 680,
          background: "#0f0f0f",
          color: "#fff",
        }}
      >
        <p><strong>Base URL API :</strong> <code>{apiBase ?? "—"}</code></p>
        <p>
          <strong>API :</strong>{" "}
          {status === "checking" ? "vérification…" : status === "ok" ? "OK ✅" : "Non joignable ❌"}
        </p>
        {msg && <p style={{ opacity: 0.85 }}>{msg}</p>}
      </section>
    </main>
  );
}
export default function Home() {
  return (
    <main className="p-6 space-y-3">
      <h1 className="text-2xl font-semibold">Le Générateur Digital</h1>

      <div className="space-x-3">
        <a className="underline" href="/auth/register">Créer un compte</a>
        <a className="underline" href="/auth/login">Se connecter</a>
        <a className="underline" href="/dashboard">Dashboard</a>
      </div>
    </main>
  );
}
