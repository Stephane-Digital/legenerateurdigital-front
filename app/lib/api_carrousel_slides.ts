// ======================================================
// 🎠 API — CARROUSEL SLIDES (LGD)
// ======================================================

export async function saveCarrouselSlide(
  slideId: number,
  payload: {
    title?: string;
    bullets?: string[];
    content?: string;
    json_layers: any[];
  }
) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/carrousel/slides/${slideId}`,
    {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    throw new Error("Erreur sauvegarde slide");
  }

  return res.json();
}
