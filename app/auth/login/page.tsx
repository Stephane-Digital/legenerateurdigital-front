import { Suspense } from "react";
import LoginContent from "./LoginContent";

function LoginPageFallback() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030303] px-6 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-120px] h-[360px] w-[360px] rounded-full bg-[#f5bf21]/12 blur-[110px]" />
        <div className="absolute bottom-[-140px] right-[-120px] h-[420px] w-[420px] rounded-full bg-[#7c3aed]/12 blur-[120px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f5bf21]/35 to-transparent" />
      </div>

      <div className="relative grid w-full max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="hidden rounded-[32px] border border-[#f5bf21]/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))] p-8 shadow-[0_0_70px_rgba(0,0,0,0.45)] lg:block">
          <div className="h-8 w-44 rounded-full bg-white/5" />
          <div className="mt-10 h-16 w-4/5 rounded-2xl bg-white/5" />
          <div className="mt-5 h-5 w-3/5 rounded-full bg-white/5" />
          <div className="mt-12 grid grid-cols-2 gap-4">
            <div className="h-28 rounded-3xl bg-white/5" />
            <div className="h-28 rounded-3xl bg-white/5" />
            <div className="h-28 rounded-3xl bg-white/5" />
            <div className="h-28 rounded-3xl bg-white/5" />
          </div>
        </div>

        <div className="rounded-[32px] border border-[#f5bf21]/20 bg-[#0b0b0b]/85 p-8 shadow-[0_0_70px_rgba(245,191,33,0.08)]">
          <div className="mx-auto mb-8 h-16 w-16 rounded-full border border-[#f5bf21]/25 bg-white/5" />
          <div className="mx-auto h-8 w-44 rounded-xl bg-white/5" />
          <div className="mx-auto mt-3 h-4 w-64 rounded-full bg-white/5" />
          <div className="mt-10 space-y-5">
            <div className="h-14 rounded-2xl bg-white/5" />
            <div className="h-14 rounded-2xl bg-white/5" />
            <div className="h-14 rounded-2xl bg-[#f5bf21]/20" />
          </div>
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
