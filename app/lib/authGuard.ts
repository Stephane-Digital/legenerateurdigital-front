// ============================================================
// 🔐 AUTH GUARD — LGD v2025 (Final Production Version)
// ============================================================
//
// Ce helper permet de protéger l'accès aux pages du Dashboard.
// Il vérifie :
// - si le cookie JWT est présent
// - si l'utilisateur est authentifié via /auth/me
//
// En cas d'échec → redirection automatique vers /auth/login.
//
// Compatible 100% App Router (Next.js 15).
//
// ============================================================

import { me } from "./auth";

export async function authGuard() {
  try {
    const user = await me();

    if (!user || !user.id) {
      return {
        authenticated: false,
        user: null,
      };
    }

    return {
      authenticated: true,
      user,
    };
  } catch (err) {
    console.warn("authGuard(): utilisateur non authentifié");
    return {
      authenticated: false,
      user: null,
    };
  }
}

export default authGuard;
