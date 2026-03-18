export type CampaignType = "vente" | "nurturing" | "lancement" | "relance";
export type ToneType = "premium" | "direct" | "storytelling" | "pedagogique";
export type SalesIntensityType = "doux" | "modere" | "fort";
export type EmailType = "nurture" | "vente" | "objection" | "relance";

export type EmailCampaignFormValues = {
  name: string;
  campaign_type: CampaignType;
  duration_days: 7 | 14 | 30;
  sender_name: string;
  offer_name: string;
  target_audience: string;
  main_promise: string;
  main_objective: string;
  primary_cta: string;
  tone: ToneType;
  sales_intensity: SalesIntensityType;
  include_nurture: boolean;
  include_sales: boolean;
  include_objection: boolean;
  include_relaunch: boolean;
  auto_cta: boolean;
  optimize_subjects: boolean;
  progressive_pressure: boolean;
};

export type EmailSequenceItem = {
  day: number;
  email_type: EmailType;
  subject: string;
  preheader: string;
  body: string;
  cta: string;
};

export type EmailSequenceResponse = {
  campaign_name: string;
  campaign_type: CampaignType;
  duration_days: number;
  sender_name: string;
  emails: EmailSequenceItem[];
};

export type SystemeIoPreparePayload = {
  systeme_tag: string;
  systeme_campaign_name: string;
  mode: "draft" | "ready" | "payload";
};

export type SavedEmailCampaignItem = {
  id: number;
  name: string;
  campaign_type: CampaignType;
  duration_days: number;
  sender_name?: string | null;
  offer_name?: string | null;
  target_audience?: string | null;
  main_promise?: string | null;
  main_objective?: string | null;
  primary_cta?: string | null;
  tone?: ToneType | null;
  sales_intensity?: SalesIntensityType | null;
  include_nurture?: boolean;
  include_sales?: boolean;
  include_objection?: boolean;
  include_relaunch?: boolean;
  auto_cta?: boolean;
  optimize_subjects?: boolean;
  progressive_pressure?: boolean;
  generated_sequence?: string | EmailSequenceResponse | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export const defaultEmailCampaignValues: EmailCampaignFormValues = {
  name: "",
  campaign_type: "vente",
  duration_days: 7,
  sender_name: "",
  offer_name: "",
  target_audience: "",
  main_promise: "",
  main_objective: "",
  primary_cta: "",
  tone: "premium",
  sales_intensity: "modere",
  include_nurture: true,
  include_sales: true,
  include_objection: true,
  include_relaunch: true,
  auto_cta: true,
  optimize_subjects: true,
  progressive_pressure: true,
};