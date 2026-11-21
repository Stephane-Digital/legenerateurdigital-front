import type { ReactNode } from "react";
import Link from "next/link";
import AlexOnDemand from "./components/AlexOnDemand";

/**
 * LGD S3.A : lien discret vers la conversation libre, indépendant des flags Vercel.
 * S2.C reste strictement inchangé : même condition, même emplacement et même composant.
 */
export default function CoachAlexV2Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-4 pt-5 sm:px-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-yellow-500/30 bg-[#11151e] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-yellow-300/80">Coach Alex · S3.A</p>
            <p className="mt-1 text-sm font-semibold text-white">Besoin de parler de ton projet ?</p>
            <p className="mt-1 text-xs text-white/65">Pose librement tes questions, sans attendre ta prochaine mission.</p>
          </div>
          <Link
            href="/dashboard/coach-ia/conversation"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-black transition hover:bg-yellow-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
          >
            Discuter avec Alex
          </Link>
        </div>
      </div>
      {process.env.NEXT_PUBLIC_LGD_ALEX_COMMANDS === "true" ? <AlexOnDemand /> : null}
      {children}
    </>
  );
}
