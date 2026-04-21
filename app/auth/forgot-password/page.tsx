"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
      <div className="bg-[#111] p-8 rounded-xl w-full max-w-md">
        <h1 className="text-xl mb-4">Mot de passe oublié</h1>

        {sent ? (
          <p className="text-green-400">
            Si un compte existe, un lien a été envoyé.
          </p>
        ) : (
          <>
            <input
              type="email"
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mb-4 bg-black border border-gray-700 rounded"
            />

            <button
              onClick={handleSubmit}
              className="w-full bg-[#d4af37] text-black py-3 rounded font-bold"
            >
              Envoyer le lien
            </button>
          </>
        )}
      </div>
    </div>
  );
}
