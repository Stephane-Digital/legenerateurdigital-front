"use client";

interface Props {
  onOpen: () => void;
}

export default function EditorMobileToolbar({ onOpen }: Props) {
  return (
    <button
      onClick={onOpen}
      className="
        fixed bottom-5 right-5 z-50
        lg:hidden
        bg-[#ffb800] text-black
        rounded-full px-5 py-3
        shadow-xl font-semibold
      "
    >
      ⚙️ Outils de l'éditeur intelligent
    </button>
  );
}
