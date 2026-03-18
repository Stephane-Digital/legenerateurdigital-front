"use client";


export default function EditorLuxe({ value, onChange }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full min-h-[280px] p-4 bg-black/40 border border-gold-600/40 rounded-xl text-gray-200 focus:outline-none"
      placeholder="Écris ton contenu... (l’IA pourra enrichir prochainement)"
    ></textarea>
  );
}
