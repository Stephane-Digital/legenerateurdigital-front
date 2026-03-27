import type { LayerData } from "@/dashboard/automatisations/reseaux_sociaux/carrousel/editor/v5/types/layers";

type BuildLeadHtmlExportInput = {
  layers: LayerData[];
  ctaUrl: string;
};

function getText(layer: any) {
  return typeof layer?.text === "string" ? layer.text : "";
}

function normalizeUrl(url: string) {
  const value = String(url || "").trim();
  if (!value) return "#sio-formulaire";

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/") ||
    value.startsWith("#")
  ) {
    return value;
  }

  return `https://${value}`;
}

function escapeHtml(input: string) {
  return String(input || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function estimateHeroMinHeight(title: string, subtitle: string, cta: string) {
  const total = (title.length * 1.4) + subtitle.length + (cta.length * 0.7);
  return Math.max(420, Math.min(760, Math.round(total * 2.2)));
}

export function buildLeadHtmlExport({
  layers,
  ctaUrl,
}: BuildLeadHtmlExportInput) {
  const visible = [...layers]
    .filter((layer: any) => layer?.visible !== false && String(layer?.id) !== "lead-canvas-height-marker")
    .sort((a: any, b: any) => Number(a?.y ?? 0) - Number(b?.y ?? 0));

  const title =
    getText(visible.find((l: any) => String(l.id).includes("lead-title"))) ||
    "Titre du lead";

  const subtitle =
    getText(visible.find((l: any) => String(l.id).includes("lead-subtitle"))) ||
    "Sous-titre du lead";

  const cta =
    getText(visible.find((l: any) => String(l.id).includes("lead-cta"))) ||
    "Recevoir le lead";

  const imageLayer = visible.find(
    (l: any) => l?.type === "image" && typeof l?.src === "string"
  );
  const imageSrc = imageLayer?.src || "";

  const benefitTexts = visible
    .filter((l: any) => String(l.id).includes("lead-benefit-"))
    .map((l: any) => getText(l))
    .filter(Boolean);

  const proofTitle =
    getText(visible.find((l: any) => String(l.id).includes("lead-proof-title"))) ||
    "Preuve sociale";

  const proofBody =
    getText(visible.find((l: any) => String(l.id).includes("lead-proof-body"))) || "";

  const faqTitle =
    getText(visible.find((l: any) => String(l.id).includes("lead-faq-title"))) ||
    "FAQ";

  const faqPairs = [
    {
      q: getText(visible.find((l: any) => String(l.id).includes("lead-faq-q1"))),
      a: getText(visible.find((l: any) => String(l.id).includes("lead-faq-a1"))),
    },
    {
      q: getText(visible.find((l: any) => String(l.id).includes("lead-faq-q2"))),
      a: getText(visible.find((l: any) => String(l.id).includes("lead-faq-a2"))),
    },
  ].filter((item) => item.q || item.a);

  const safeCtaUrl = escapeHtml(normalizeUrl(ctaUrl));
  const heroMinHeight = estimateHeroMinHeight(title, subtitle, cta);

  const benefitsHtml = benefitTexts
    .map(
      (text) =>
        `<div style="padding:18px;border:1px solid rgba(255,184,0,0.18);border-radius:18px;background:#111111;color:#ffffff;font-size:18px;line-height:1.7;">${escapeHtml(
          text
        )}</div>`
    )
    .join("");

  const faqHtml = faqPairs
    .map(
      (item) => `
        <div style="padding:18px;border:1px solid rgba(255,184,0,0.18);border-radius:18px;background:#111111;">
          <div style="font-size:20px;font-weight:800;color:#ffffff;">${escapeHtml(
            item.q
          )}</div>
          <div style="margin-top:10px;font-size:17px;line-height:1.7;color:#d4d4d8;">${escapeHtml(
            item.a
          )}</div>
        </div>
      `
    )
    .join("");

  return `
<div style="max-width:1200px;margin:0 auto;background:linear-gradient(180deg,#120d02,#050505);color:#ffffff;font-family:Inter,Arial,sans-serif;border:1px solid rgba(255,184,0,0.18);border-radius:32px;overflow:hidden;">
  <section style="display:grid;grid-template-columns:minmax(0,1.05fr) minmax(320px,0.95fr);gap:0;border-bottom:1px solid rgba(255,184,0,0.14);align-items:stretch;">
    <div style="padding:56px;min-height:${heroMinHeight}px;display:flex;flex-direction:column;justify-content:center;">
      <div style="display:inline-block;padding:8px 14px;border-radius:999px;border:1px solid rgba(255,184,0,0.22);background:#111111;color:#ffb800;font-size:11px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;">Aimant à prospects</div>
      <h1 style="margin:22px 0 0 0;font-size:58px;line-height:1.02;font-weight:800;color:#ffffff;">${escapeHtml(
        title
      )}</h1>
      <p style="margin:24px 0 0 0;max-width:720px;font-size:22px;line-height:1.7;color:#d4d4d8;">${escapeHtml(
        subtitle
      )}</p>
      <div style="margin-top:30px;">
        <a href="${safeCtaUrl}" style="display:inline-block;padding:18px 24px;border-radius:18px;background:#ffb800;color:#111111;font-size:18px;font-weight:800;text-decoration:none;">${escapeHtml(
    cta
  )}</a>
      </div>
    </div>
    <div style="padding:28px;border-left:1px solid rgba(255,184,0,0.14);display:flex;">
      <div style="width:100%;min-height:${heroMinHeight}px;border-radius:26px;overflow:hidden;border:1px solid rgba(255,184,0,0.16);background:#111111;display:flex;align-items:center;justify-content:center;">
        ${
          imageSrc
            ? `<img src="${escapeHtml(
                imageSrc
              )}" alt="Visuel du lead" style="width:100%;height:100%;object-fit:contain;object-position:center center;background:#111111;" />`
            : `<div style="padding:24px;color:#d4d4d8;">Ajoute un visuel hero depuis l’éditeur</div>`
        }
      </div>
    </div>
  </section>

  <section style="padding:44px;">
    <div style="font-size:28px;font-weight:800;color:#ffb800;">Bénéfices</div>
    <div style="margin-top:20px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;">${benefitsHtml}</div>
  </section>

  <section style="padding:0 44px 44px 44px;">
    <div style="padding:28px;border:1px solid rgba(255,184,0,0.16);border-radius:28px;background:#0d0d0d;">
      <div style="font-size:28px;font-weight:800;color:#ffb800;">${escapeHtml(
        proofTitle
      )}</div>
      <div style="margin-top:16px;font-size:20px;line-height:1.8;color:#d4d4d8;">${escapeHtml(
        proofBody
      )}</div>
    </div>
  </section>

  <section style="padding:0 44px 44px 44px;">
    <div style="padding:28px;border:1px solid rgba(255,184,0,0.16);border-radius:28px;background:#0d0d0d;">
      <div style="font-size:28px;font-weight:800;color:#ffb800;">${escapeHtml(
        faqTitle
      )}</div>
      <div style="margin-top:20px;display:grid;gap:16px;">${faqHtml}</div>
    </div>
  </section>

  <section id="sio-formulaire" style="padding:0 44px 44px 44px;">
    <div style="padding:28px;border:1px dashed rgba(255,184,0,0.30);border-radius:28px;background:#111111;color:#ffb800;text-align:center;font-size:16px;line-height:1.8;">
      👉 Ajoute ici ton formulaire natif Systeme.io juste après avoir collé ce HTML.
    </div>
  </section>
</div>
`.trim();
}
