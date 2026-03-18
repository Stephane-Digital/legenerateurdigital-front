export function getCurrentWeek() {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);

    days.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("fr-FR", { weekday: "short" }),
    });
  }

  return days;
}

export function getMonthMatrix() {
  const now = new Date();

  const year = now.getFullYear();
  const month = now.getMonth();

  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - ((first.getDay() + 6) % 7));

  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);

    days.push({
      date: d.toISOString().slice(0, 10),
      label: d.getDate(),
    });
  }

  return days;
}
