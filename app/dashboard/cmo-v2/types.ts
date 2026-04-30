import type { EmailSequenceDay, EmailSequencePro } from "../email-campaigns/lib/emailEnginePro";

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

export type CMOContext = {
  objective: string;
  blocker: string;
  offer: string;
  audience: string;
  niche?: string;
  pain?: string;
  desire?: string;
  angle: string;
  promise: string;
  mechanism?: string;
  objection?: string;
  cta: string;
  tone: string;
};

export type CMODecision = {
  recommended_module: CMOTarget;
  priority_action: string;
  reason: string;
};

export type CMOEmailPayload = {
  module: "emailing";
  campaign_goal: string;
  offer_name: string;
  target_audience: string;
  main_blocker: string;
  conversion_angle: string;
  main_promise: string;
  primary_cta: string;
  tone: string;
  sequence_direction: string[];
};

export type CMOLeadPayload = {
  module: "lead_engine";
  lead_goal: string;
  lead_magnet_angle: string;
  lead_magnet_promise: string;
  target_audience: string;
  problem_to_solve: string;
  offer_bridge: string;
  cta_label: string;
  landing_direction: string;
};

export type CMOEditorPayload = {
  module: "editor";
  creative_goal: string;
  format_recommendation: "post" | "carrousel";
  hook_direction: string;
  body_direction: string;
  visual_direction: string;
  caption_direction: string;
};

export type CMOCoachPayload = {
  module: "coach";
  mission_title: string;
  brief: string;
  expected_output: string;
  duration_minutes: number;
};

export type CMOModulePayloads = {
  emailing: CMOEmailPayload;
  lead_engine: CMOLeadPayload;
  editor: CMOEditorPayload;
  coach: CMOCoachPayload;
};

export type CMODispatchResult = {
  diagnostic: string;
  decision: CMODecision;
  context: CMOContext;
  module_payloads: CMOModulePayloads;
  assumptions: string[];
  warnings: string[];
  meta?: {
    module?: string;
    mode?: string;
    model?: string;
    content_generation?: string;
  };
};

export type CMOPayload = {
  created_at: string;
  source: "cmo_dispatch_system";
  target: CMOTarget;
  module: CMOModule;
  targetModule: CMOTarget;
  destination: CMOTarget;
  cmo_mode: "dispatch_only";
  content_generation: "module_only";

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

  dispatch: CMODispatchResult;

  generated_content?: {
    email_sequence?: EmailSequenceDay[];
    email_sequence_text?: string;
    post?: string;
    email?: string;
  };

  content_ready: {
    email: {
      campaignName: string;
      campaignType: "vente" | "relance" | "lancement" | "nurturing";
      offerName: string;
      targetAudience: string;
      mainPromise: string;
      mainObjective: string;
      primaryCta: string;
      suggestedSubject: string;
      previewText: string;
      firstEmailBody: string;
      cmoBrief: CMOEmailPayload;
      emailSequence?: EmailSequencePro;
      emailSequenceText?: string;
    };
    lead: {
      magnetName: string;
      headline: string;
      promise: string;
      angle: string;
      audience: string;
      offer: string;
      cta: string;
      cmoBrief: CMOLeadPayload;
    };
    editor: {
      format: "post" | "carrousel";
      hook: string;
      body: string;
      cta: string;
      caption: string;
      cmoBrief: CMOEditorPayload;
    };
    coach: {
      missionTitle: string;
      brief: string;
      briefText: string;
      kpiLabel: string;
      durationMinutes: number;
      cmoBrief: CMOCoachPayload;
    };
  };
};
// =============================
// EMAIL ENGINE V3 (LOCK)
// =============================

export type EmailContextV3 = {
  offer: string;
  target: string;
  pain: string;
  promise: string;
  cta: string;
};

export type EmailV3 = {
  day: number;
  subject: string;
  preheader: string;
  short: string;
  long: string;
};
