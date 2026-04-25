"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

const PUBLIC_DASHBOARD_PATHS = ["/dashboard", "/dashboard/affiliation"];

function isPublicPath(pathname: string | null) {
  const path = pathname || "";

  return PUBLIC_DASHBOARD_PATHS.some((publicPath) => {
    if (path === publicPath) return true;
    return path.startsWith(`${publicPath}/`);
  });
}

function AuthProtectedContent({ children }: { children: ReactNode }) {
  const { loading } = useAuthGuard();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-300 text-lg">
        Vérification de la session...
      </div>
    );
  }

  return <>{children}</>;
}

export default function ProtectedPage({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (isPublicPath(pathname)) {
    return <>{children}</>;
  }

  return <AuthProtectedContent>{children}</AuthProtectedContent>;
}
