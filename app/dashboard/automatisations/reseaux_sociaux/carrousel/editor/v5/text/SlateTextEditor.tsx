"use client";

import { useCallback, useMemo } from "react";
import { createEditor, Descendant } from "slate";
import { Editable, Slate, withReact } from "slate-react";

import SlateToolbar from "./SlateToolbar";
import { deserializeSlate, serializeSlate } from "./slateUtils";

interface Props {
  value?: string; // JSON stocké dans le layer
  onChange: (json: string) => void;
}

export default function SlateTextEditor({ value, onChange }: Props) {
  const editor = useMemo(() => withReact(createEditor()), []);

  const initialValue = useMemo<Descendant[]>(
    () => deserializeSlate(value),
    [value]
  );

  const renderLeaf = useCallback(({ attributes, children, leaf }: any) => {
    let el = children;

    if (leaf.bold) el = <strong>{el}</strong>;
    if (leaf.italic) el = <em>{el}</em>;
    if (leaf.underline) el = <u>{el}</u>;

    return (
      <span
        {...attributes}
        style={{
          color: leaf.color || "#FFD369",
          fontSize: leaf.fontSize || 36,
          fontFamily: leaf.fontFamily || "Inter",
        }}
      >
        {el}
      </span>
    );
  }, []);

  return (
    <div className="space-y-2">
      <Slate
        editor={editor}
        initialValue={initialValue}
        onChange={(val) => onChange(serializeSlate(val))}
      >
        <SlateToolbar editor={editor} />

        <div className="bg-[#111] border border-yellow-500/20 rounded-md p-3">
          <Editable
            renderLeaf={renderLeaf}
            placeholder="Écrivez votre texte…"
            className="min-h-[120px] outline-none text-center"
          />
        </div>
      </Slate>
    </div>
  );
}
