"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function SocialAccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAccounts = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/social-accounts`,
        { credentials: "include" }
      );

      const data = await res.json();
      setAccounts(data);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const connect = async (provider: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/social-auth/connect/${provider}`,
      { credentials: "include" }
    );

    const data = await res.json();
    window.location.href = data.url; // redirection OAuth
  };

  const providers = [
    { key: "instagram", label: "Instagram", color: "from-pink-500 to-yellow-500" },
    { key: "tiktok", label: "TikTok", color: "from-gray-800 to-gray-500" },
    { key: "linkedin", label: "LinkedIn", color: "from-blue-600 to-blue-300" },
    { key: "facebook", label: "Facebook", color: "from-blue-700 to-blue-400" },
  ];

  const isConnected = (p: string) =>
    accounts.some((acc) => acc.provider === p);

  return (
    <div className="min-h-screen px-6 pb-24 text-white">

      <div className="max-w-4xl mx-auto text-center mt-[40px] mb-12">
        <h1 className="text-4xl font-bold text-yellow-400">
          Connexion Réseaux Sociaux
        </h1>
        <p className="text-gray-400 mt-2">
          Permets au Générateur Digital de publier automatiquement pour toi.
        </p>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Chargement…</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-10 place-items-center">

          {providers.map((p) => (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`
                w-full max-w-sm p-6 rounded-xl bg-[#111]
                border ${isConnected(p.key) ? "border-green-500" : "border-yellow-500/20"}
                shadow-lg
              `}
            >
              <div className="text-center">
                <div className={`mb-4 text-2xl font-bold bg-gradient-to-r ${p.color} text-transparent bg-clip-text`}>
                  {p.label}
                </div>

                {isConnected(p.key) ? (
                  <p className="text-green-400 font-semibold">
                    ✓ Connecté
                  </p>
                ) : (
                  <button
                    onClick={() => connect(p.key)}
                    className="mt-4 px-6 py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition"
                  >
                    Connecter {p.label}
                  </button>
                )}
              </div>
            </motion.div>
          ))}

        </div>
      )}
    </div>
  );
}
