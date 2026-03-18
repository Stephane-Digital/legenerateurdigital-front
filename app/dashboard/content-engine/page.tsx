"use client";

import { useEffect, useState } from "react";
import ContentForm from "./components/ContentForm";
import ContentHistory from "./components/ContentHistory";
import ContentResult from "./components/ContentResult";

export default function ContentEnginePage() {
  const [result, setResult] = useState("");
  const [history, setHistory] = useState([]);

  const loadHistory = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/content-engine/history`,
      { credentials: "include" }
    );
    setHistory(await res.json());
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-yellow-400">
        Content Engine IA
      </h1>

      <ContentForm
        onGenerated={(text) => {
          setResult(text);
          loadHistory();
        }}
      />

      <ContentResult result={result} />

      <ContentHistory
        history={history}
        onSelect={(item) => setResult(item.response_text)}
      />
    </div>
  );
}
