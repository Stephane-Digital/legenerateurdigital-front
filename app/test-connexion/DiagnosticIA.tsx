"use client";

export function analyserErreur(err: any, url: string): string {
  if (!err) return "Aucune erreur détectée.";

  const msg = err.message || String(err);

  // 🔹 Cas 1 — Backend injoignable
  if (msg.includes("Failed to fetch") || msg.includes("NetworkError"))
    return "❌ Impossible de joindre le backend. Vérifie que FastAPI tourne sur http://127.0.0.1:8000 et que ton .env frontend pointe bien vers cette URL.";

  // 🔹 Cas 2 — CORS
  if (msg.includes("CORS") || msg.includes("Access-Control"))
    return "⚠️ Erreur CORS détectée : ajoute ton domaine frontend dans la variable CORS_ORIGINS du backend (par ex. http://localhost:3000).";

  // 🔹 Cas 3 — Méthode non autorisée
  if (msg.includes("405") || msg.includes("Method Not Allowed"))
    return `⚠️ L’endpoint ${url} existe mais la méthode utilisée n’est pas autorisée. Essaie avec une autre méthode (GET, POST…).`;

  // 🔹 Cas 4 — Backend en ligne mais JSON invalide
  if (msg.includes("Unexpected token") || msg.includes("invalid json"))
    return "⚠️ Le backend répond mais ne renvoie pas du JSON valide. Vérifie le retour de ta route FastAPI.";

  // 🔹 Cas 5 — Erreur serveur 500
  if (msg.includes("500") || msg.includes("Internal Server Error"))
    return "💥 Le backend est en ligne, mais a rencontré une erreur interne (500). Vérifie les logs dans la console FastAPI.";

  // 🔹 Cas 6 — OK mais lent
  if (msg.includes("timeout"))
    return "⚠️ La connexion au backend est très lente. Vérifie si Render ou ton serveur local ne limite pas la bande passante.";

  // 🔹 Par défaut
  return "ℹ️ Erreur non reconnue — consulte la console pour plus de détails.";
}
