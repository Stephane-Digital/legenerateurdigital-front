"use client";

export default function SalesPagePreview({ form }) {
  return (
    <div className="bg-black/40 border border-yellow-600/20 rounded-lg p-5 overflow-y-auto max-h-[70vh]">
      <h3 className="text-xl font-bold text-yellow-400 mb-4">Prévisualisation</h3>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{form.title}</h1>
        <h2 className="text-lg opacity-80">{form.subtitle}</h2>

        <p><strong>Audience :</strong> {form.audience}</p>
        <p><strong>Produit :</strong> {form.product}</p>
        <p><strong>Offre :</strong> {form.offer}</p>

        {form.structure && (
          <div className="pt-3 text-yellow-300/80">
            <strong>Structure personnalisée :</strong>
            <pre className="whitespace-pre-wrap mt-2">{form.structure}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
