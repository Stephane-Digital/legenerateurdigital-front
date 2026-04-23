/* app/dashboard/admin/ia-quotas/lib/types.ts
   LGD — Admin Quotas IA (frontend types)
*/
export type AdminQuotaPlan = "azur" | "essentiel" | "pro" | "ultime";
export type AdminQuotaFeature = "global" | "coach" | "posts" | "carrousel" | "audit";
export type AdminQuotaFeatureStrict = AdminQuotaFeature;

export type AdminQuotaSource = "ia_quota" | "ia_quota(credits_only)" | "unknown";

export type AdminQuotaItem = {
  user_id: number;
  email?: string | null;
  plan?: AdminQuotaPlan | null;          // effective plan if backend provides it
  feature: AdminQuotaFeatureStrict;
  tokens_used: number;
  tokens_limit: number;
  updated_at?: string | null;
};

export type AdminQuotasMeta = {
  total: number;
  source: AdminQuotaSource;
  note?: string | null;
};

export type AdminQuotasQuery = {
  feature?: AdminQuotaFeature | "toutes";
  plan?: AdminQuotaPlan | "tous";
  q?: string;         // email or user_id
  page?: number;
  page_size?: 10 | 25 | 50;
};
