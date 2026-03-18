import { Descendant } from "slate";

export const DEFAULT_SLATE_VALUE: Descendant[] = [
  {
    type: "paragraph",
    align: "center",
    children: [
      {
        text: "Votre texte ici",
        fontSize: 42,
        color: "#FFD369",
        fontFamily: "Inter",
      },
    ],
  },
];

// 👉 Sérialisation propre pour Canvas / Layer
export function serializeSlate(value: Descendant[]) {
  return JSON.stringify(value);
}

export function deserializeSlate(json?: string): Descendant[] {
  if (!json) return DEFAULT_SLATE_VALUE;
  try {
    return JSON.parse(json);
  } catch {
    return DEFAULT_SLATE_VALUE;
  }
}
