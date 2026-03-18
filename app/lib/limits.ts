// ============================================================
// 🎛️ LIMITES & QUOTAS IA — LGD v2025 (Version Premium Stable)
// ============================================================
//
// Centralise toutes les limites IA de la plateforme :
// - Génération IA Carrousel
// - IA Texte (Content Engine)
// - Background IA / Style Transfer
// - Génération Slides Premium
//
// Utilisé côté front pour afficher les limites
// et côté back pour valider l’accès via plan utilisateur.
//
// ============================================================

// 📌 Plans disponibles dans LGD
export type UserPlan = "essential" | "pro" | "ultimate";

// ============================================================
// 🎯 LIMITES PAR PLAN
// ============================================================
//
// Ces limites sont cohérentes avec le backend (ai_quota_model.py)
// Elles pourront être modifiées facilement pour aligner le business model.
//
// ============================================================

export const IA_LIMITS = {
  essential: {
    daily_requests: 20,
    max_slides: 5,
    premium_styles: false,
    ai_background: false,
    ai_style_transfer: false,
  },
  pro: {
    daily_requests: 200,
    max_slides: 10,
    premium_styles: true,
    ai_background: true,
    ai_style_transfer: true,
  },
  ultimate: {
    daily_requests: 9999,
    max_slides: 25,
    premium_styles: true,
    ai_background: true,
    ai_style_transfer: true,
  },
};

// ============================================================
// 🧠 UTILITAIRE : Récupérer un quota
// ============================================================

export function getIALimits(plan: UserPlan) {
  return IA_LIMITS[plan] || IA_LIMITS["essential"];
}

// ============================================================
// 🔥 UTILITAIRE : Vérifier si un utilisateur peut générer X slides
// ============================================================

export function canGenerateSlides(plan: UserPlan, count: number): boolean {
  const limit = getIALimits(plan).max_slides;
  return count <= limit;
}

// ============================================================
// 🔥 UTILITAIRE : Vérifier l’accès aux fonctionnalités premium IA
// ============================================================

export function canUsePremiumStyle(plan: UserPlan): boolean {
  return getIALimits(plan).premium_styles;
}

export function canUseBackgroundIA(plan: UserPlan): boolean {
  return getIALimits(plan).ai_background;
}

export function canUseStyleTransferIA(plan: UserPlan): boolean {
  return getIALimits(plan).ai_style_transfer;
}
