export function generateMonthMatrix(month: number, year: number) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  const matrix = [];
  let week = [];

  // Ajoute jours vides avant le 1er
  const startDay = (first.getDay() + 6) % 7;
  for (let i = 0; i < startDay; i++) {
    week.push({ day: "", full: "" });
  }

  // Jours du mois
  for (let d = 1; d <= last.getDate(); d++) {
    const full = new Date(year, month, d)
      .toISOString()
      .slice(0, 10);

    week.push({ day: d, full });

    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
  }

  // Compléter la dernière semaine
  while (week.length < 7) week.push({ day: "", full: "" });
  matrix.push(week);

  return matrix;
}
