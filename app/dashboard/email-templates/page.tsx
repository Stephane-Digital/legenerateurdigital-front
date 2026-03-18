"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import TemplateCard from "./components/TemplateCard";
import TemplateForm from "./components/TemplateForm";

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);

  const loadTemplates = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/email-templates/list`,
      { credentials: "include" }
    );
    const data = await res.json();
    setTemplates(data);
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  return (
    <div className="min-h-screen w-full px-4 py-10 flex flex-col items-center text-white">
      <motion.h1
        className="text-3xl font-bold text-center mb-10 bg-gradient-to-r from-yellow-500 to-yellow-300 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        📑 Templates d’Emails IA
      </motion.h1>

      {/* BOUTON CREER */}
      <button
        onClick={() => {
          setEditTemplate(null);
          setShowForm(true);
        }}
        className="bg-yellow-600 hover:bg-yellow-500 text-black px-5 py-2 rounded-xl mb-10"
      >
        ➕ Créer un Template
      </button>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
        {templates.map((tpl) => (
          <TemplateCard
            key={tpl.id}
            template={tpl}
            onEdit={() => {
              setEditTemplate(tpl);
              setShowForm(true);
            }}
            onDelete={async () => {
              await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/email-templates/delete/${tpl.id}`,
                { method: "DELETE", credentials: "include" }
              );
              loadTemplates();
            }}
          />
        ))}
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <TemplateForm
          template={editTemplate}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            loadTemplates();
          }}
        />
      )}
    </div>
  );
}
