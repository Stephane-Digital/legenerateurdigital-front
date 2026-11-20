import type { ReactNode } from "react";
import AlexOnDemand from "./components/AlexOnDemand";

/** S2.C : layout isolé. Aucun changement au Shell Alex, StageRenderer ni aux missions. */
export default function CoachAlexV2Layout({ children }: { children: ReactNode }) {
  return (
    <>
      {process.env.NEXT_PUBLIC_LGD_ALEX_COMMANDS === "true" ? <AlexOnDemand /> : null}
      {children}
    </>
  );
}
