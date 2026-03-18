"use client";

import { useMemo } from "react";

// ✅ FIX TS minimal : helpers locaux (../utils/date n’exporte plus getMonthMatrix / normalizeDate)
function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Retourne une matrice 6x7 (semaines x jours) pour afficher un mois en grille.
 * Chaque cellule contient:
 * - date: Date
 * - isCurrentMonth: boolean
 */
function getMonthMatrix(baseDate: Date) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const startDay = firstOfMonth.getDay(); // 0=dimanche ... 6=samedi

  // On veut commencer le lundi => convertit en index lundi=0...dimanche=6
  const mondayIndex = (startDay + 6) % 7;

  const gridStart = new Date(year, month, 1 - mondayIndex);

  const weeks: { date: Date; isCurrentMonth: boolean }[][] = [];
  let cursor = normalizeDate(gridStart);

  for (let w = 0; w < 6; w++) {
    const row: { date: Date; isCurrentMonth: boolean }[] = [];
    for (let d = 0; d < 7; d++) {
      const cellDate = normalizeDate(cursor);
      row.push({
        date: cellDate,
        isCurrentMonth: cellDate.getMonth() === month,
      });
      cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1);
    }
    weeks.push(row);
  }

  return weeks;
}

export default function useCalendar(currentDate: Date) {
  const safeDate = currentDate instanceof Date ? currentDate : new Date();

  const monthMatrix = useMemo(() => getMonthMatrix(safeDate), [safeDate]);

  // Flatten pratique pour CalendarGrid (si utilisé)
  const days = useMemo(() => monthMatrix.flat(), [monthMatrix]);

  return {
    monthMatrix,
    days,
    normalizeDate,
    getMonthMatrix,
  };
}
