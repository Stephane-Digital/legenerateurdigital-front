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
    <div className="card-premium fade-in mx-auto my-8 max-w-md p-6 shadow-lg">
      <h3 className="text-gradient mb-6 text-center text-2xl font-bold">Nouvelle automatisation</h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Champ Nom */}
        <input
          type="text"
          placeholder="Nom de l’automatisation"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border border-[#184b6e] bg-[#0d2a3b]/70 px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#ffb800] focus:outline-none"
        />

        {/* Sélecteur Statut */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-[#184b6e] bg-[#0d2a3b]/70 px-4 py-2 text-white focus:ring-2 focus:ring-[#009dff] focus:outline-none"
        >
          <option value="Active">Active</option>
          <option value="En pause">En pause</option>
        </select>

        {/* Groupe de boutons centré */}
        <div className="button-group mt-6">
          <button
            type="submit"
            className="btn-luxe transition-transform duration-200 hover:scale-105"
          >
            Ajouter
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn-luxe-blue transition-transform duration-200 hover:scale-105"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
