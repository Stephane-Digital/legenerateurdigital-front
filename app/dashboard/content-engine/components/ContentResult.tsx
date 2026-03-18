"use client";


export default function ContentResult({ result }) {
  if (!result) return null;

  const copy = () => navigator.clipboard.writeText(result);

  const download = () => {
    const blob = new Blob([result], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "contenu.txt";
    link.click();
  };

  return (
    <div className="bg-[#0f0f0f] border border-yellow-600/30 p-6 rounded-2xl space-y-4">
      <h2 className="text-xl font-bold text-yellow-400">Résultat</h2>

      <div className="whitespace-pre-wrap">{result}</div>

      <div className="flex gap-4 pt-4">
        <button
          className="bg-yellow-600 text-black px-4 py-2 rounded-lg"
          onClick={copy}
        >
          Copier
        </button>

        <button
          className="bg-gray-700 px-4 py-2 rounded-lg"
          onClick={download}
        >
          Télécharger
        </button>
      </div>
    </div>
  );
}
