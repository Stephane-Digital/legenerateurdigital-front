"use client";


export default function useDay(selectedDate: Date | null) {
  const date = selectedDate || new Date();

  return {
    selected: date,
  };
}
