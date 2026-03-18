import { Descendant } from "slate";

export interface CanvasTextChunk {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize: number;
  fontFamily: string;
  color: string;
}

export function parseSlateToChunks(
  json?: string
): CanvasTextChunk[] {
  if (!json) return [];

  try {
    const value: Descendant[] = JSON.parse(json);
    const chunks: CanvasTextChunk[] = [];

    value.forEach((block: any) => {
      if (!block.children) return;

      block.children.forEach((leaf: any) => {
        chunks.push({
          text: leaf.text ?? "",
          bold: !!leaf.bold,
          italic: !!leaf.italic,
          underline: !!leaf.underline,
          fontSize: leaf.fontSize ?? 36,
          fontFamily: leaf.fontFamily ?? "Inter",
          color: leaf.color ?? "#FFD369",
        });
      });
    });

    return chunks;
  } catch {
    return [];
  }
}
