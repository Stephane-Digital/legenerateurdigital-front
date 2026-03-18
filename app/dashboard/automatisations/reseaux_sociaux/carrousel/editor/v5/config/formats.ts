export type CanvasFormatKey =
  | "instagram_post"
  | "instagram_story"
  | "facebook"
  | "linkedin"
  | "pinterest";

export const CANVAS_FORMATS: Record<
  CanvasFormatKey,
  { label: string; w: number; h: number }
> = {
  instagram_post: {
    label: "Instagram Post (1:1)",
    w: 1080,
    h: 1080,
  },
  instagram_story: {
    label: "Instagram Story (9:16)",
    w: 1080,
    h: 1920,
  },

  facebook: {
    label: "Facebook Post",
    w: 1200,
    h: 628,
  },
  linkedin: {
    label: "LinkedIn Post",
    w: 1200,
    h: 628,
  },
  pinterest: {
    label: "Pinterest Pin",
    w: 1000,
    h: 1500,
  },
};
