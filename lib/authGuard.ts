"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/api";

/**
 * Protège une page : si l'utilisateur n'est pas connecté (pas de token),
 * il est redirigé vers /auth/login.
 */
export function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/auth/login");
    }
  }, [router]);
}
