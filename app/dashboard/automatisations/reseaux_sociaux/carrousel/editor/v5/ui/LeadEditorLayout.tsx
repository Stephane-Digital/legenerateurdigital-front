"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "lgd_lead_engine_builder_v4";

export default function LeadEditorLayout() {
  const [state, setState] = useState<any>({
    layers: [],
    background: { type: "color", value: "#0A0A0A" },
  });

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setState(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Load error", e);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Save error", e);
    }
  }, [state]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          state.background?.type === "color"
            ? state.background.value
            : "#0A0A0A",
        color: "white",
        padding: "40px",
      }}
    >
      <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>
        Lead Engine V4.2
      </h1>

      <button
        onClick={() =>
          setState((prev: any) => ({
            ...prev,
            layers: [
              ...prev.layers,
              { id: Date.now(), type: "text", content: "Nouveau texte" },
            ],
          }))
        }
      >
        Ajouter texte
      </button>

      <div style={{ marginTop: "40px" }}>
        {state.layers.map((layer: any) => (
          <div key={layer.id} style={{ marginBottom: "10px" }}>
            {layer.content}
          </div>
        ))}
      </div>
    </div>
  );
}
