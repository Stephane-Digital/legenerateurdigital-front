"use client";

import { useState } from "react";

export default function AutomationForm({ onAdd, onCancel }) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("Active");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ id: Date.now(), name, status });
    setName("");
  };

  return (
    <div className="card-premium fade-in mx-auto my-8 p-6 max-w-md shadow-lg">
      <h3 className="text-gradient text-center text-2xl font-bold mb-6">
        Nouvelle automatisation
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Champ Nom */}
        <input
          type="text"
          placeholder="Nom de l’automatisation"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-[#0d2a3b]/70 border border-[#184b6e] rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ffb800]"
        />

        {/* Sélecteur Statut */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-[#0d2a3b]/70 border border-[#184b6e] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#009dff]"
        >
          <option value="Active">Active</option>
          <option value="En pause">En pause</option>
        </select>

        {/* Groupe de boutons centré */}
        <div className="button-group mt-6">
          <button
            type="submit"
            className="btn-luxe hover:scale-105 transition-transform duration-200"
          >
            Ajouter
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn-luxe-blue hover:scale-105 transition-transform duration-200"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
