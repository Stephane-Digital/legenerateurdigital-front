"use client";

export default function UiDemoPage() {
  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] text-white px-6">
      <h1 className="text-4xl font-extrabold mb-10 text-gradient text-center">
        💎 UI Demo
      </h1>

      <div className="w-full max-w-[900px] mb-[20px] flex justify-center">
        <button className="btn-luxe w-full py-4 text-center">
          Tester un bouton doré
        </button>
      </div>

      <div className="w-full max-w-[900px] card-luxe text-center">
        <h2 className="text-2xl font-semibold text-gradient mb-4">
          Démonstration du Design LGD
        </h2>
        <p className="text-gray-300 mb-2">
          Visualisez et testez les composants luxe dorés du projet.
        </p>
        <div className="button-group justify-center mt-4">
          <button className="btn-luxe">Bouton Doré</button>
          <button className="btn-luxe-blue">Bouton Bleu</button>
        </div>
      </div>
    </div>
  );
}
