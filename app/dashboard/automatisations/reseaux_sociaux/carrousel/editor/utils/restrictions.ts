// ============================================================================
// 🟡 SYSTEME DE LIMITATIONS — LGD PREMIUM (SAFE SSR VERSION)
// ============================================================================

export const FEATURES = {
  ai_bg: ["pro", "ultimate"],
  ai_styles: ["pro", "ultimate"],
  ai_templates: ["pro", "ultimate"],
  ai_audit: ["pro", "ultimate"],
  ai_performance: ["pro", "ultimate"],

  import_images: ["essential", "pro", "ultimate"],
  add_text: ["essential", "pro", "ultimate"],

  export_pdf: ["pro", "ultimate"],
  export_png_hd: ["essential", "pro", "ultimate"],
  export_mp4: ["ultimate"],
} as const;

export const LIMITS = {
  ai_bg: { essential: 2, pro: 10, ultimate: Infinity },
  ai_styles: { essential: 0, pro: 10, ultimate: Infinity },
  ai_templates: { essential: 0, pro: 5, ultimate: Infinity },
  ai_audit: { essential: 0, pro: 5, ultimate: Infinity },
  ai_performance: { essential: 0, pro: 5, ultimate: Infinity },
  export_mp4: { essential: 0, pro: 2, ultimate: Infinity },
} as const;


// ============================================================================
// 🟣 1) Vérification simple
// ============================================================================
export function checkFeatureAccess(feature: string, plan: string): boolean {
  if (!FEATURES[feature]) return true;
  return FEATURES[feature].includes(plan as any);
}


// ============================================================================
// 🟢 UTILS: Chargement sécurisé localStorage
// ============================================================================
function loadUsage(): any {
  if (typeof window === "undefined") return {};   // SSR SAFE
  try {
    return JSON.parse(localStorage.getItem("lgd_usage") || "{}");
  } catch {
    return {};
  }
}

function saveUsage(usage: any): void {
  if (typeof window === "undefined") return;      // SSR SAFE
  localStorage.setItem("lgd_usage", JSON.stringify(usage));
}


// ============================================================================
// 🔵 2) Vérifier quota (SAFE SSR)
// ============================================================================
export function checkQuota(feature: string, plan: string): boolean {
  if (plan === "ultimate") return true;
  if (!LIMITS[feature]) return true;

  const today = new Date().toISOString().slice(0, 10);
  const limit = LIMITS[feature][plan as "essential" | "pro" | "ultimate"];
  if (limit === Infinity) return true;

  const usage = loadUsage();

  if (!usage[today]) usage[today] = {};
  if (!usage[today][feature]) usage[today][feature] = 0;

  return usage[today][feature] < limit;
}


// ============================================================================
// 🔥 3) Incrémenter quota (SAFE SSR)
// ============================================================================
export function incrementQuota(feature: string): void {
  const today = new Date().toISOString().slice(0, 10);

  const usage = loadUsage();
  if (!usage[today]) usage[today] = {};
  if (!usage[today][feature]) usage[today][feature] = 0;

  usage[today][feature] += 1;

  saveUsage(usage);
}


// ============================================================================
// 🔰 4) Vérification complète
// ============================================================================
export function canUseFeature(feature: string, plan: string): boolean {
  if (!checkFeatureAccess(feature, plan)) return false;
  if (!checkQuota(feature, plan)) return false;
  return true;
}
