"use client";

import { useEffect, useState } from "react";

export default function BibliothequePage() {
  const [automatisations, setAutomatisations] = useState([]);
  const [formations, setFormations] = useState([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");

  // ✅ Charger les catégories locales et les données
  useEffect(() => {
    const savedCategories = localStorage.getItem("lgd_categories");
    if (savedCategories) setCategories(JSON.parse(savedCategories));

    const fetchData = async () => {
      try {
        const [autoRes, formRes] = await Promise.all([
          fetch("/api/automatisations"),
          fetch("/api/formations"),
        ]);

        const [autoData, formData] = await Promise.all([
          autoRes.json(),
          formRes.json(),
        ]);

        setAutomatisations(Array.isArray(autoData) ? autoData : []);
        setFormations(Array.isArray(formData) ? formData : []);
      } catch (error) {
        console.error("Erreur de chargement :", error);
      }
    };

    fetchData();
  }, []);

  // ✅ Ajouter une catégorie
  const handleAddCategory = () => {
    if (newCategory.trim() === "") return;
    const updated = [...categories, newCategory.trim()];
    setCategories(updated);
    localStorage.setItem("lgd_categories", JSON.stringify(updated));
    setNewCategory("");
  };

  // ✅ Supprimer une catégorie
  const handleDeleteCategory = (name: string) => {
    const updated = categories.filter((cat) => cat !== name);
    setCategories(updated);
    localStorage.setItem("lgd_categories", JSON.stringify(updated));
  };

  // 🧩 Bloc générique de section
  const renderSection = (
    title: string,
    icon: string,
    items: any[],
    emptyText: string
  ) => (
    <section className="w-full flex flex-col items-center">
      <h2 className="text-2xl font-semibold text-[#ffb800] mb-[20px]">
        {icon} {title}
      </h2>
      <div className="flex flex-wrap justify-center gap-[20px]">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-[#0d2a3b]/90 border border-[#184b6e] rounded-[12px] shadow-lg p-[15px] w-[300px] text-center flex flex-col items-center justify-center hover:scale-[1.03] transition-transform duration-300"
            >
              <h3 className="text-lg font-semibold mb-[10px] text-[#ffb800]">
                {item.name || item.title}
              </h3>
              <p className="text-gray-300 mb-[15px]">
                {item.status || item.type}
              </p>
              <button className="btn-luxe-blue px-4 py-2 text-sm w-[130px]">
                Ouvrir
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">{emptyText}</p>
        )}
      </div>
    </section>
  );

  // 🧱 Contenu principal
  return (
    <div
      className="
        min-h-screen flex flex-col items-center justify-start text-white p-6
      "
    >
      {/* 🔹 Titre principal */}
      <h1 className="text-3xl font-bold text-gradient mb-2 text-center">
        📚 Ma Bibliothèque LGD
      </h1>
      <p className="text-[#ffb800] mb-8 text-center">
        Espace personnel — vos créations et ressources marketing
      </p>

      {/* 🧱 Bloc centré : champ + bouton */}
      <div className="flex items-center justify-center gap-[10px] mb-[40px]">
        <input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Nouvelle catégorie..."
          className="bg-[#0d2a3b]/80 border border-[#184b6e] rounded-lg p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#ffb800] min-w-[260px]"
        />
        <button
          onClick={handleAddCategory}
          className="btn-luxe-blue text-sm px-6 py-3"
        >
          + Ajouter
        </button>
      </div>

      {/* 🧩 Catégories dynamiques */}
      {categories.length > 0 && (
        <div className="w-full max-w-[900px] flex flex-col items-center mb-[40px]">
          <h2 className="text-xl font-semibold text-[#ffb800] mb-[15px]">
            📂 Mes Catégories personnalisées
          </h2>
          <div className="flex flex-wrap justify-center gap-[15px]">
            {categories.map((cat, i) => (
              <div
                key={i}
                className="bg-[#0d2a3b]/90 border border-[#184b6e] rounded-[10px] px-4 py-3 flex items-center gap-3 text-sm text-white shadow-md"
              >
                <span>{cat}</span>
                <button
                  onClick={() => handleDeleteCategory(cat)}
                  className="text-[#ff4b4b] hover:text-red-500 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🧩 Sections par défaut */}
      <div className="w-full max-w-[1100px] flex flex-col items-center justify-center gap-[50px]">
        {renderSection(
          "Mes Automatisations",
          "⚙️",
          automatisations,
          "Aucune automatisation enregistrée."
        )}
        {renderSection(
          "Mes Formations",
          "🎓",
          formations,
          "Aucune formation enregistrée."
        )}
      </div>
    </div>
  );
}
