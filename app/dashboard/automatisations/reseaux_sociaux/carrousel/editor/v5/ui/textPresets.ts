// =====================================================
// 🎨 LGD — Presets Typographiques Pro
// =====================================================

export type TextPresetKey =
  | "title"
  | "subtitle"
  | "hook"
  | "paragraph"
  | "cta";

export interface TextPreset {
  label: string;
  style: {
    fontFamily: string;
    fontSize: number;
    fontWeight?: "normal" | "bold";
    fontStyle?: "normal" | "italic";
    textDecoration?: "none" | "underline";
    lineHeight: number;
    letterSpacing?: number;
    textTransform?: "none" | "uppercase";
  };
}

export const TEXT_PRESETS: Record<TextPresetKey, TextPreset> = {
  title: {
    label: "Titre",
    style: {
      fontFamily: "Montserrat",
      fontSize: 96,
      fontWeight: "bold",
      lineHeight: 1.1,
      textTransform: "uppercase",
    },
  },

  subtitle: {
    label: "Sous-titre",
    style: {
      fontFamily: "Poppins",
      fontSize: 56,
      fontWeight: "bold",
      lineHeight: 1.2,
    },
  },

  hook: {
    label: "Hook",
    style: {
      fontFamily: "Oswald",
      fontSize: 72,
      fontWeight: "bold",
      lineHeight: 1.15,
    },
  },

  paragraph: {
    label: "Paragraphe",
    style: {
      fontFamily: "Inter",
      fontSize: 40,
      fontWeight: "normal",
      lineHeight: 1.4,
    },
  },

  cta: {
    label: "CTA",
    style: {
      fontFamily: "Montserrat",
      fontSize: 48,
      fontWeight: "bold",
      textDecoration: "underline",
      lineHeight: 1.2,
    },
  },
};
