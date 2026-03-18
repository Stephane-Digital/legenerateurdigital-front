// app/utils/sales_api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getPage(id: string | number) {
  try {
    const res = await fetch(`${API_URL}/public/sales-pages/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Erreur API getPage =>", res.status);
      return null;
    }

    return await res.json();
  } catch (e) {
    console.error("Erreur API (getPage) :", e);
    return null;
  }
}
