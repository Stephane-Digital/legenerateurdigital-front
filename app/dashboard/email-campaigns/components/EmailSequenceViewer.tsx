"use client";

import { useMemo, useState } from "react";
import type { EmailCampaignFormValues, EmailSequenceResponse } from "./types";

type Props = {
  formValues: EmailCampaignFormValues;
  sequence: EmailSequenceResponse | null;
  onSaved?: (id: number) => void;
  onReset?: () => void;
};

function cleanText(value: unknown) {
  return String(value ?? "")
    .replace(/\*\*/g, "")
    .replace(/CTA\s*:/gi, "")
    .replace(/CORPS\s*:/gi, "")
    .replace(/VERSION COURTE[\s\S]*?(?=VERSION LONGUE|NOTE LGD|={10,}|$)/gi, "")
    .replace(/VERSION LONGUE[\s\S]*?(?=NOTE LGD|={10,}|$)/gi, "")
    .replace(/- Colle uniquement la version courte OU la version longue dans le corps de l’email\./gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function addLinks(text: string) {
  if (/LIENS UTILES À INSÉRER AVANT ENVOI SIO/i.test(text)) return text;

  return `${text}

--------------------------------------------------
LIENS UTILES À INSÉRER AVANT ENVOI SIO :
- Page de vente : https://legenerateurdigital.systeme.io/lgd
- Accès LGD : https://legenerateurdigital-front.vercel.app`;
}

function extractText(sequence: EmailSequenceResponse | null) {
  if (!sequence) return "";

  const data: any = sequence;

  const candidates = [
    data.plainTextExport,
    data.plain_text_export,
    data.export_text,
    data.sequenceText,
    data.plainText,
    data.content,
  ];

  const direct = candidates.find(
    (v) => typeof v === "string" && v.length > 20
  );

  if (direct) {
    return addLinks(cleanText(direct));
  }

  if (Array.isArray(data.days)) {
    const text = data.days
      .map((day: any) => {
        return cleanText(`
==================================================
${day.label || `EMAIL JOUR ${day.day}`}
==================================================

OBJETS :

A → ${day.subjects?.a || ""}
B → ${day.subjects?.b || ""}
C → ${day.subjects?.c || ""}

PRÉHEADER :
${day.preheader || ""}

----------------------------------------

${day.longStory || day.long || ""}

CTA :

A → ${day.ctaVariants?.a || ""}
B → ${day.ctaVariants?.b || ""}
C → ${day.ctaVariants?.c || ""}
`);
      })
      .join("\n\n");

    return addLinks(text);
  }

  return "";
}

export default function EmailSequenceViewer({
  formValues,
  sequence,
  onReset,
}: Props) {
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => extractText(sequence), [sequence]);

  async function copyOutput() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <section className="rounded-2xl border border-yellow-400/10 bg-black/40 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-yellow-300 font-bold text-xl">
          Email prêt à copier
        </h2>

        <div className="flex gap-3">
          <button
            onClick={copyOutput}
            className="px-4 py-2 bg-yellow-500/20 rounded-lg text-yellow-200"
          >
            {copied ? "Copié ✅" : "Copier"}
          </button>

          {onReset && (
            <button
              onClick={onReset}
              className="px-4 py-2 bg-white/10 rounded-lg text-white/70"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <pre className="whitespace-pre-wrap text-sm text-white/90 leading-7 max-h-[600px] overflow-auto">
        {output}
      </pre>
    </section>
  );
}
