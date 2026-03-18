"use client";

import { Editor } from "slate";

interface Props {
  editor: Editor;
}

export default function SlateToolbar({ editor }: Props) {
  const toggleMark = (mark: string) => {
    const isActive = Editor.marks(editor)?.[mark];
    if (isActive) Editor.removeMark(editor, mark);
    else Editor.addMark(editor, mark, true);
  };

  return (
    <div className="flex gap-2 p-2 bg-[#0e0e0e] border border-yellow-500/20 rounded-md">
      <ToolbarButton onClick={() => toggleMark("bold")} label="B" />
      <ToolbarButton onClick={() => toggleMark("italic")} label="I" />
      <ToolbarButton onClick={() => toggleMark("underline")} label="U" />
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className="px-3 py-1 text-yellow-400 hover:bg-yellow-500/10 rounded font-semibold"
    >
      {label}
    </button>
  );
}
