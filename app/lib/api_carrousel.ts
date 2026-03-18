// =======================================================
//  LGD — API Carrousel (Frontend) — OPTION A (Backend Bulk)
//  Version 100% alignée backend — 2025-12-10
// =======================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// ----------------------------
// WRAPPER HTTP
// ----------------------------
async function request(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `Erreur API ${res.status}`);
  }

  return res.json();
}

// =======================================================
// IA — PRESET / BACKGROUND / CREATE-FROM-SLIDES
// =======================================================

export function generateCarrouselPreset(payload: {
  prompt: string;
  slides_count: number;
}) {
  return request("/ai/carrousel/preset", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function generateCarrouselBackground(payload: { prompt: string }) {
  return request("/ai/carrousel/background", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createCarrouselFromIASlides(payload: {
  title: string;
  slides: any[];
}) {
  return request("/ai/carrousel/create-from-slides", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * ✅ Compat / Alias utilisé par CarrouselAIModal.tsx
 * Ne change aucune feature : construit un prompt et appelle /ai/carrousel/preset
 */
export function generateCarrouselIA(payload: {
  theme: string;
  style: string;
  tone: string;
  slides: number;
}) {
  const prompt =
    `Thème: ${payload.theme}\n` +
    `Style: ${payload.style}\n` +
    `Ton: ${payload.tone}\n` +
    `Génère un carrousel complet, structuré, avec une slide d'accroche, ` +
    `des slides de valeur, et une slide de conclusion/CTA.`;

  return generateCarrouselPreset({
    prompt,
    slides_count: payload.slides,
  });
}

// =======================================================
// CRUD PRINCIPAL CARROUSEL (OPTION A — BULK MODE)
// =======================================================

// 🔵 Create
export function createCarrousel(payload: { title: string; description?: string }) {
  return request("/carrousel/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// 🔵 List ALL carrousels of the connected user (Nouvelle route backend)
export function getUserCarrousels() {
  return request("/carrousel/", {
    method: "GET",
  });
}

// 🔵 Read (carrousel + slides)
export function getCarrouselById(id: number) {
  return request(`/carrousel/${id}`, { method: "GET" });
}

// 🔵 Update COMPLET (titre + description + SLIDES BULK)
export function updateCarrousel(id: number, payload: any) {
  return request(`/carrousel/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// 🔵 Delete carrousel + slides (cascade)
export function deleteCarrousel(id: number) {
  return request(`/carrousel/${id}`, {
    method: "DELETE",
  });
}
