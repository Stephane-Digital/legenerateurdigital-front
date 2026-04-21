"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, password }),
    });

    setDone(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
      <div className="bg-[#111] p-8 rounded-xl w-full max-w-md">
        <h1 className="text-xl mb-4">Nouveau mot de passe</h1>

        {done ? (
          <p className="text-green-400">
            Mot de passe mis à jour. Vous pouvez vous connecter.
          </p>
        ) : (
          <>
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mb-4 bg-black border border-gray-700 rounded"
            />

            <button
              onClick={handleSubmit}
              className="w-full bg-[#d4af37] text-black py-3 rounded font-bold"
            >
              Valider
            </button>
          </>
        )}
      </div>
    </div>
  );
}
