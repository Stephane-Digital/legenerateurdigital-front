"use client";

interface SidebarSlidesProps {
  slides: any[];
  currentIndex: number;
  setCurrentIndex: (i: number) => void;
}

export default function SidebarSlides({
  slides,
  currentIndex,
  setCurrentIndex,
}: SidebarSlidesProps) {
  return (
    <div className="w-24 bg-[#0f0f0f] border-r border-yellow-500/20 py-6 flex flex-col items-center gap-4 overflow-y-auto">

      {slides.map((s, idx) => (
        <button
          key={s.id}
          onClick={() => setCurrentIndex(idx)}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
            ${currentIndex === idx ? "bg-yellow-400 text-black" : "bg-[#1a1a1a] text-yellow-300"}
            hover:bg-yellow-300 hover:text-black transition
          `}
        >
          {idx + 1}
        </button>
      ))}
    </div>
  );
}
