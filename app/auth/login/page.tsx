import { Suspense } from "react";
import LoginContent from "./LoginContent";

function LoginPageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white px-6">
      <div className="w-full max-w-md rounded-2xl border border-[#C9A14A]/20 bg-[#111111] p-8 shadow-[0_0_30px_rgba(201,161,74,0.08)]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full border border-[#C9A14A]/30 bg-[#151515]" />
          <div className="mx-auto h-8 w-40 rounded bg-[#1A1A1A]" />
          <div className="mx-auto mt-3 h-4 w-64 rounded bg-[#151515]" />
        </div>

        <div className="space-y-5">
          <div>
            <div className="mb-2 h-4 w-28 rounded bg-[#1A1A1A]" />
            <div className="h-12 w-full rounded-xl border border-[#C9A14A]/10 bg-[#0F0F0F]" />
          </div>

          <div>
            <div className="mb-2 h-4 w-32 rounded bg-[#1A1A1A]" />
            <div className="h-12 w-full rounded-xl border border-[#C9A14A]/10 bg-[#0F0F0F]" />
          </div>

          <div className="h-12 w-full rounded-xl bg-[#1A1A1A]" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginContent />
    </Suspense>
  );
}
