"use client";

import { useState } from "react";

export default function AutomationForm({ onAdd, onCancel }) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("Active");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ id: Date.now(), name, status });
    setName("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#0d2a3b]/90 border border-[#1c4966] p-6 rounded-lg shadow-xl flex flex-col gap-4 max-w-md mx-auto"
    >
      <h3 className="text-xl font-bold text-[#ffb800] text-center">
        Nouvelle automatisation
      </h3>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nom de l’automatisation"
        className="p-2 rounded-md bg-[#123650] text-white border border-[#1b5277] focus:outline-none focus:ring-2 focus:ring-[#ffb800]"
      />

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="p-2 rounded-md bg-[#123650] text-white border border-[#1b5277]"
      >
        <option value="Active">Active</option>
        <option value="En pause">En pause</option>
      </select>

      <div className="flex justify-between mt-4">
        <button
          type="submit"
          className="bg-gradient-to-r from-[#ffb800] to-[#ff6b00] text-[#0a2540] font-semibold px-4 py-2 rounded-md hover:opacity-90 transition"
        >
          Ajouter
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-cyan-300 hover:text-cyan-100 transition"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
