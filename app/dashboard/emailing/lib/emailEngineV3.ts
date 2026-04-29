// EMAIL ENGINE V3 LOCKED

type EmailContext = {
  offer: string;
  target: string;
  pain: string;
  promise: string;
  cta: string;
};

function clean(text: string) {
  return text
    .replace(/\*\*/g, "")
    .replace(/CTA\s*:/gi, "")
    .replace(/Cet email vise.*$/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function safe(value?: string, fallback = "") {
  if (!value || value.trim().length < 3) return fallback;
  return value;
}

function buildShort(ctx: EmailContext) {
  return clean(`
Bonjour [Prénom],

${safe(ctx.promise, "Vous pouvez avancer dès aujourd’hui.")}

👉 ${safe(ctx.cta, "Passer à l’action maintenant")}

À très vite,
LGD
`);
}

function buildLongDay1(ctx: EmailContext) {
  return clean(`
Bonjour,

Vous ressentez sûrement ceci :

${safe(ctx.pain)}

Mais la réalité est différente.

${safe(ctx.promise)}

Avec ${safe(ctx.offer)}, vous pouvez avancer étape par étape, sans vous sentir perdu.

👉 ${safe(ctx.cta)}

À très vite,
LGD
`);
}

function buildLongDayGeneric(ctx: EmailContext) {
  return clean(`
Bonjour,

${safe(ctx.pain)}

Mais voici ce que vous devez comprendre :

${safe(ctx.promise)}

Tout commence par une décision.

👉 ${safe(ctx.cta)}

À très vite,
LGD
`);
}

export function generateEmailSequenceV3(ctx: EmailContext) {
  const emails = [];

  for (let i = 1; i <= 7; i++) {
    const long =
      i === 1
        ? buildLongDay1(ctx)
        : buildLongDayGeneric(ctx);

    const short = buildShort(ctx);

    if (long.length < 80) {
      throw new Error("Email content too short → BLOCKED");
    }

    emails.push({
      day: i,
      subject: `Jour ${i} — Passe à l’action`,
      preheader: safe(ctx.promise),
      short,
      long,
    });
  }

  return emails;
}
