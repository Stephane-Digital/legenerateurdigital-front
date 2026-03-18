export async function getSocialPosts() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/social-posts/`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data;
  } catch (e) {
    console.error("Erreur getSocialPosts:", e);
    return [];
  }
}
