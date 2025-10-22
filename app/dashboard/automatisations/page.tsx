"use client";

import { useState } from "react";
import AutomationList from "@/components/dashboard/AutomationList";
import AutomationForm from "@/components/dashboard/AutomationForm";

export default function AutomatisationsPage() {
  const [automations, setAutomations] = useState([
    { id: 1, name: "Welcome Email", status: "Active" },
    { id: 2, name: "Newsletter Hebdo", status: "En pause" },
  ]);

  const [isAdding, setIsAdding] = useState(false);

  const handleAddAutomation = (newAutomation) => {
    setAutomations([...automations, newAutomation]);
    setIsAdding(false);
  };

  const handleDeleteAutomation = (id) => {
    setAutomations(automations.filter((a) => a.id !== id));
  };

  return (
    <section className="mx-auto w-full max-w-5xl my-[20px] px-6 text-white">
      <h2 className="text-3xl font-extrabold text-center mb-[30px] text-[#ffb800]">
        Automatisations LGD
      </h2>

      {isAdding ? (
        <AutomationForm
          onAdd={handleAddAutomation}
          onCancel={() => setIsAdding(false)}
        />
      ) : (
        <>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-gradient-to-r from-[#ffb800] to-[#ff6b00] text-[#0a2540] font-semibold px-5 py-2 rounded-md mb-6 hover:opacity-90 transition"
          >
            + Nouvelle automatisation
          </button>

          <AutomationList
            automations={automations}
            onDelete={handleDeleteAutomation}
          />
        </>
      )}
    </section>
  );
}

