"use client";

import { Suspense } from "react";
import LoginContent from "./LoginContent";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
          Chargement...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
