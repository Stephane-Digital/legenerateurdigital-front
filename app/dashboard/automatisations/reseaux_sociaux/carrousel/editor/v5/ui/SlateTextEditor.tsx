"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createEditor, Descendant } from "slate";
import { withHistory } from "slate-history";
import {
  Editable,
  ReactEditor,
  Slate,
  useSlate,
  withReact,
} from "slate-react";

/* =========================
   Types
========================= */

type TextStyle = {
  color?: string;
};

interface Props {
  valueText: string;
  style: TextStyle;
  onChangeText: (nextText: string) => void;
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onToggleUnderline: () => void;
}

/* =========================
   Helpers
========================= */

function buildInitialValue(text: string): Descendant[] {
  return [
    {
      type: "paragraph",
      children: [{ text: text ?? "" }],
    } as any,
  ];
}

/**
 * ✅ EXTRACTION TEXTE SAFE
 * (Slate officiel)
 */
function extractPlainText(value: Descendant[]): string {
  return value
    .map((node: any) =>
      node.children?.map((c: any) => c.text).join("") ?? ""
    )
    .join("\n");
}

/* =========================
   Marks
========================= */

function isMarkActive(editor: any, format: string) {
  const marks = editor.marks?.();
  return marks ? marks[format] === true : false;
}

function toggleMark(editor: any, format: string) {
  const active = isMarkActive(editor, format);
  if (active) editor.removeMark(format);
  else editor.addMark(format, true);
}

/* =========================
   Toolbar
========================= */

function Toolbar({
  onToggleBold,
  onToggleItalic,
  onToggleUnderline,
}: {
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onToggleUnderline: () => void;
}) {
  const editor = useSlate();

  return (
    <div className="flex items-center gap-2 p-2 border-b border-yellow-500/10">
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          toggleMark(editor, "bold");
          onToggleBold();
        }}
        className="px-3 py-1 rounded bg-yellow-500/20 text-yellow-200"
      >
        B
      </button>

      <button
        onMouseDown={(e) => {
          e.preventDefault();
          toggleMark(editor, "italic");
          onToggleItalic();
        }}
        className="px-3 py-1 rounded bg-yellow-500/20 text-yellow-200"
      >
        I
      </button>

      <button
        onMouseDown={(e) => {
          e.preventDefault();
          toggleMark(editor, "underline");
          onToggleUnderline();
        }}
        className="px-3 py-1 rounded bg-yellow-500/20 text-yellow-200"
      >
        U
      </button>
    </div>
  );
}

/* =========================
   Main Editor
========================= */

export default function SlateTextEditor({
  valueText,
  style,
  onChangeText,
  onToggleBold,
  onToggleItalic,
  onToggleUnderline,
}: Props) {
  const editor = useMemo(
    () => withHistory(withReact(createEditor() as ReactEditor)),
    []
  );

  const [value, setValue] = useState<Descendant[]>(() =>
    buildInitialValue(valueText)
  );

  // Sync uniquement quand on change de layer
  useEffect(() => {
    setValue(buildInitialValue(valueText));
  }, [valueText]);

  const renderLeaf = useCallback(
    ({ attributes, children, leaf }: any) => {
      return (
        <span
          {...attributes}
          style={{
            color: style.color ?? "#ffffff",
            fontSize: 16, // ✅ FIXE — UX PRO
            fontWeight: leaf.bold ? "bold" : "normal",
            fontStyle: leaf.italic ? "italic" : "normal",
            textDecoration: leaf.underline ? "underline" : "none",
          }}
        >
          {children}
        </span>
      );
    },
    [style.color]
  );

  return (
    <div className="rounded-xl border border-yellow-500/15 bg-black/40">
      <Slate
        editor={editor}
        initialValue={value}
        onChange={(nextValue) => {
          setValue(nextValue);
          onChangeText(extractPlainText(nextValue));
        }}
      >
        <Toolbar
          onToggleBold={onToggleBold}
          onToggleItalic={onToggleItalic}
          onToggleUnderline={onToggleUnderline}
        />

        <div className="p-3">
          <Editable
            spellCheck={false}
            placeholder="Écrivez votre texte…"
            className="min-h-[80px] outline-none text-yellow-100"
            renderLeaf={renderLeaf}
          />
        </div>
      </Slate>
    </div>
  );
}
