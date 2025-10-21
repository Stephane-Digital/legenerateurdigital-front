"use client";

import React from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center text-white bg-[#0d2a3b]">
      <h2 className="text-2xl font-semibold mb-2">Oups ! Une erreur est survenue 😕</h2>
      <p className="text-gray-300 mb-4">{error.message}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg text-white font-medium"
      >
        Réessayer
      </button>
    </div>
  );
}
