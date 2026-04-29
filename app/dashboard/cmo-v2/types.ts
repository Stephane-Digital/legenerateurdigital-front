export type CMOModule = "email" | "lead" | "editor" | "coach";

export type CMOTarget = "emailing" | "lead_engine" | "editor" | "coach";

export type CMOStrategy = {
  target: string;
  pain: string;
  desire: string;
  promise: string;
  angle: string;
  mechanism: string;
  cta: string;
};

export type CMOPayload = {
  created_at: string;
  source: "cmo_v2_assisted";

  target: CMOTarget;
  module: CMOModule;
  targetModule: CMOTarget;
  destination: CMOTarget;

  priority_action: string;
  diagnostic: string;
  why_this_action: string;
  next_best_action: string;

  objective: string;
  blocker?: string;

  audience?: string;
  offer?: string;
  promise?: string;
  angle?: string;
  cta?: string;
  tone?: string;

  // 🔥 AJOUT CRITIQUE (corrige ton erreur build)
  strategy?: CMOStrategy;

  generated_content?: {
    post?: string;
    email?: string;
    cta?: string;
    lead_magnet_idea?: string;
  };

  content_ready?: {
    email?: {
      campaignName?: string;
      campaignType?: "vente" | "relance" | "lancement" | "nurturing";
      offerName?: string;
      targetAudience?: string;
      mainPromise?: string;
      mainObjective?: string;
      primaryCta?: string;
      suggestedSubject?: string;
      previewText?: string;
      firstEmailBody?: string;
    };

    lead?: {
      magnetName?: string;
      headline?: string;
      promise?: string;
      angle?: string;
      audience?: string;
     
