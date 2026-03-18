"use client";

export default function UiDemoPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] px-6 text-white">
      <h1 className="text-gradient mb-10 text-center text-4xl font-extrabold">💎 UI Demo</h1>

      <div className="mb-[20px] flex w-full max-w-[900px] justify-center">
        <button className="btn-luxe w-full py-4 text-center">Tester un bouton doré</button>
      </div>

      <div className="card-luxe w-full max-w-[900px] text-center">
        <h2 className="text-gradient mb-4 text-2xl font-semibold">Démonstration du Design LGD</h2>
        <p className="mb-2 text-gray-300">
          Visualisez et testez les composants luxe dorés du projet.
        </p>
        <div className="button-group mt-4 justify-center">
          <button className="btn-luxe">Bouton Doré</button>
          <button className="btn-luxe-blue">Bouton Bleu</button>
        </div>
      </div>
    </div>
  );
}
