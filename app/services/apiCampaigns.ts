export async function fetchCampaigns() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campaigns`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Erreur chargement campagnes :", await res.text());
    throw new Error("Erreur chargement campagnes");
  }

  return res.json();
}

// Compat éventuelle avec anciens imports
export const getCampaigns = fetchCampaigns;

export async function createCampaign(data: any) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campaigns`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    console.error("Erreur création campagne :", await res.text());
    throw new Error("Erreur création campagne");
  }

  return res.json();
}
