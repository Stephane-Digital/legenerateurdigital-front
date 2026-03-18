"use client";

export function usePlannerWeek() {
  const fetchWeek = async (start: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/planner/week?start=${start}`,
      {
        credentials: "include",
      }
    );

    if (!res.ok) {
      throw new Error("Erreur récupération planner");
    }

    return res.json();
  };

  return { fetchWeek };
}
