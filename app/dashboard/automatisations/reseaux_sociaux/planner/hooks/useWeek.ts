"use client";

import { useMemo } from "react";

export default function useWeek(currentMonth: Date, selectedDate: Date | null) {
  const weekDays = useMemo(() => {
    const base = selectedDate ? new Date(selectedDate) : new Date(currentMonth);
    const dayOfWeek = base.getDay(); // 0 = dimanche

    // On force lundi = début de semaine
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(base);
    monday.setDate(base.getDate() + mondayOffset);

    // Génère les 7 jours
    const days = [...Array(7)].map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });

    return days;
  }, [currentMonth, selectedDate]);

  return { weekDays };
}
