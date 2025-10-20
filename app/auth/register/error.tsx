"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  return (
    <div style={{ color: "white", textAlign: "center", padding: "40px" }}>
      <h2>Oups ! Une erreur est survenue 😬</h2>
      <p>{error.message}</p>
      <button
        onClick={() => reset()}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Réessayer
      </button>
    </div>
  );
}
