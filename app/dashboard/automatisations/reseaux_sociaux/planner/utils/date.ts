// ===========================================================
// 📅 LGD — Utils Dates (Planner Deluxe 4.3) — SAFE
// ===========================================================

type DateInput = Date | string;

// -----------------------------------------------------------
// ➤ Normalisation centrale (ANTI-CRASH)
// -----------------------------------------------------------
function normalizeDate(date: DateInput): Date {
  if (date instanceof Date) return date;
  return new Date(date);
}

export function normalizeDateParts(date: DateInput) {
  const d = normalizeDate(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// -----------------------------------------------------------
// ➤ Retourne une clé unique AAAA-MM-JJ
// -----------------------------------------------------------
export function formatDateKey(date: DateInput): string {
  const d = normalizeDate(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// -----------------------------------------------------------
// ➤ Jours du mois (42 cases fixes pour grille propre)
// -----------------------------------------------------------
export function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

  const days: {
    date: Date;
    isCurrentMonth: boolean;
    key: string;
  }[] = [];

  let current = new Date(year, month, 1 - startOffset);

  for (let i = 0; i < 42; i++) {
    days.push({
      date: new Date(current),
      isCurrentMonth: current.getMonth() === month,
      key: formatDateKey(current),
    });
    current.setDate(current.getDate() + 1);
  }

  return days;
}

// -----------------------------------------------------------
// ➤ Début / fin de semaine
// -----------------------------------------------------------
export function startOfWeek(date: DateInput) {
  const d = normalizeDate(date);
  const day = d.getDay() === 0 ? 6 : d.getDay() - 1;
  d.setDate(d.getDate() - day);
  return normalizeDateParts(d);
}

export function endOfWeek(date: DateInput) {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return normalizeDateParts(end);
}

// -----------------------------------------------------------
// ➤ Retourne les 7 jours d'une semaine
// -----------------------------------------------------------
export function getWeekDays(date: DateInput) {
  const start = startOfWeek(date);
  const days: { date: Date; key: string }[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push({
      date: d,
      key: formatDateKey(d),
    });
  }

  return days;
}

// -----------------------------------------------------------
// ➤ Rendu poussé du jour : "Lun 24"
// -----------------------------------------------------------
export function formatDay(date: DateInput): string {
  const d = normalizeDate(date);
  return d
    .toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
    })
    .replace(".", "");
}

// -----------------------------------------------------------
// ➤ Range semaine : "20 Jan — 26 Jan"
// -----------------------------------------------------------
export function getWeekRange(date: DateInput): string {
  const start = startOfWeek(date);
  const end = endOfWeek(date);

  const opts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
  };

  const s = start.toLocaleDateString("fr-FR", opts).replace(".", "");
  const e = end.toLocaleDateString("fr-FR", opts).replace(".", "");

  return `${s} — ${e}`;
}

// -----------------------------------------------------------
// ➤ Tools
// -----------------------------------------------------------
export function addDays(date: DateInput, days: number) {
  const d = normalizeDate(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isToday(date: DateInput) {
  const d = normalizeDate(date);
  const t = new Date();

  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}
