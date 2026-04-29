export type CMOModule = "email" | "lead" | "editor" | "coach";

export type CMOPayload = {
  module: CMOModule;
  objective: string;
  blocker?: string;
  audience?: string;
  offer?: string;
  tone?: string;
  // prêt pour les modules
  content_ready?: {
    email?: {
      subjectHint?: string;
      angle?: string;
      cta?: string;
    };
    lead?: {
      magnetIdea?: string;
      promise?: string;
    };
    editor?: {
      postIdea?: string;
      hook?: string;
    };
    coach?: {
      briefText: string; // ⚠️ texte, pas JSON
    };
  };
};
